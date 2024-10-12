import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { zfd } from 'zod-form-data'
import { db } from '@src/clients/db.client'
import { authValidator } from '@src/utils/auth.validator'

export const missionSchema = zfd.formData({
  title: zfd.text(),
  description: zfd.text(),
})

export const missions = new Hono()

missions.post(
  '/',
  authValidator,
  // TODO: Using form content-type for file upload
  validator('form', async (val, c) => {
    const { error, data } = await missionSchema.safeParseAsync(val)
    if (error) return c.json(error, 400)

    return data
  }),
  async c => {
    const { session } = c.req.valid('cookie')
    const val = c.req.valid('form')

    await db.mission.create({
      data: {
        userId: session.userId,
        ...val,
      },
    })

    return c.body(null, 204)
  },
)
