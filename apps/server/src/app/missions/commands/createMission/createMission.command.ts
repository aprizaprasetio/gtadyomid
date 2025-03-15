import { type } from 'arktype'
import { validator } from 'hono/validator'
import { db } from '@infra/clients/db.client'
import { factory } from '@app/common/clients/factory.client'
import { authValidator } from '@app/common/validators/auth.validator'
import { missionSchema } from '@app/missions/commands/createMission/createMission.schema'
import { storeMissionImage } from '@app/missions/commands/createMission/createMission.func'
import type { StoredImagePath } from '@app/common/constants/images.constant'

export const createMission = factory.createHandlers(
  authValidator,
  validator('form', async (val, c) => {
    const data = missionSchema(val)
    if (data instanceof type.errors) {
      return c.json(data.summary, 400)
    }

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
