import { nanoid } from 'nanoid'
import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { zfd } from 'zod-form-data'
import type { MissionImage } from '@prisma/client'
import { db } from '@src/infra/clients/db.client'
import { authValidator } from '@src/app/common/validators/auth.validator'
import { s3 } from '@src/infra/clients/s3.client'
import sharp = require('sharp')

const allowedImageTypes = ['image/webp', 'image/png']
const allowedImageExtensions = ['webp', 'png']
const allowedImageSize = 1_048_576
const imageVariants = {
  high: 1_920,
  medium: 480,
  small: 360,
}
const s3ImageFolder = 'images'
type StoredImagePath = Pick<
  MissionImage,
  'highPath' | 'mediumPath' | 'smallPath'
>

export const missionSchema = zfd.formData({
  title: zfd.text(),
  description: zfd.text(),
  images: zfd.repeatableOfType(
    zfd
      .file()
      .refine(
        file => {
          const isValidType = allowedImageTypes.includes(file.type)
          let isValidExtension = false

          for (let i = 0; i < allowedImageExtensions.length; i++) {
            if (file.name.endsWith(allowedImageExtensions[i])) {
              isValidExtension = true
              break
            }
          }

          return isValidType && isValidExtension
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

async function resizeImage(image: File, width: number) {
  const imageArrayBuffer = await image.arrayBuffer()
  return sharp(imageArrayBuffer).resize(width).webp().toBuffer()
}

async function storeImageS3(name: string, image: Buffer) {
  const path = `${s3ImageFolder}/${name}-${nanoid(10)}.webp`
  await s3.file(path).write(image)

  return path
}

async function storeMissionImage(
  name: string,
  image: File,
): Promise<StoredImagePath> {
  const high = await resizeImage(image, imageVariants.high)
  const medium = await resizeImage(image, imageVariants.medium)
  const small = await resizeImage(image, imageVariants.small)

  return {
    highPath: await storeImageS3(name, high),
    mediumPath: await storeImageS3(name, medium),
    smallPath: await storeImageS3(name, small),
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
    const sanitizedName = val.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9.-]/g, '')
    for (let i = 0; i < images.length; i++) {
      storedImages[i] = storeMissionImage(`${sanitizedName}-${i}`, images[i])
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
