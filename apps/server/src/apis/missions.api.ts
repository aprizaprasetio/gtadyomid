import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { zfd } from 'zod-form-data'
import type { MissionImage } from '@prisma/client'
import { db } from '@src/clients/db.client'
import { authValidator } from '@src/utils/auth.validator'
import { s3 } from '@src/clients/s3.client'
import sharp = require('sharp')

const allowedImageTypes = ['image/webp', 'image/png']
const allowedImageExtensions = ['webp', 'png']
const allowedImageSize = 1_048_576
const imageVariants = {
  high: 1_920,
  medium: 480,
  small: 360,
}
const imageBucket = 'images'
type StoredImagePath = Promise<
  Pick<MissionImage, 'highPath' | 'mediumPath' | 'smallPath'>
>

export const missionSchema = zfd.formData({
  title: zfd.text(),
  description: zfd.text(),
  images: zfd.repeatableOfType(
    zfd
      .file()
      .refine(
        file => {
          const isValidTypes = allowedImageTypes.includes(file.type)
          let isValidExtensions = false

          for (let i = 0; i < allowedImageExtensions.length; i++) {
            if (file.name.endsWith(allowedImageExtensions[i])) {
              isValidExtensions = true
              break
            }
          }

          return isValidTypes && isValidExtensions
        },
        {
          message: `Image should be ${allowedImageExtensions.join(' or ')}`,
        },
      )
      .refine(image => image.size <= allowedImageSize, {
        message: 'Image should be less than 1MB',
      }),
  ),
})

async function storeImage(image: File, width: number) {
  const path = `${imageBucket}/${Bun.randomUUIDv7()}.webp`

  const imageArrayBuffer = await image.arrayBuffer()
  const sharpBuffer = await sharp(imageArrayBuffer)
    .resize(width)
    .webp()
    .toBuffer()
  await s3.file(path).write(sharpBuffer)

  return path
}

async function getImagePath(image: File): Promise<StoredImagePath> {
  return {
    highPath: await storeImage(image, imageVariants.high),
    mediumPath: await storeImage(image, imageVariants.medium),
    smallPath: await storeImage(image, imageVariants.small),
  }
}

export const missions = new Hono()

missions.post(
  '/',
  authValidator,
  validator('form', async (val, c) => {
    const { error, data } = await missionSchema.safeParseAsync(val)
    if (error) return c.json(error, 400)

    return data
  }),
  async c => {
    const { session } = c.req.valid('cookie')
    const { images, ...val } = c.req.valid('form')

    const storedImages: Promise<StoredImagePath>[] = []
    for (let i = 0; i < images.length; i++) {
      storedImages[i] = getImagePath(images[0])
    }

    await db.mission.create({
      data: {
        userId: session.userId,
        images: {
          createMany: {
            data: await Promise.all(storedImages),
          },
        },
        ...val,
      },
    })

    return c.body(null, 204)
  },
)
