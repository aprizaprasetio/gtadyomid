import { validator } from 'hono/validator'
import { registerSchema } from '@app/users/commands/registerUser/registerUser.schema'
import {
  emailError,
  usernameError,
} from '@app/users/commands/registerUser/registerUser.error'
import { db } from '@infra/clients/db.client'
import { factory } from '@app/common/clients/factory.client'
import { type } from 'arktype'

export const registerUser = factory.createHandlers(
  validator('json', async (val, c) => {
    const data = registerSchema(val)
    if (data instanceof type.errors) return c.json(data.summary, 400)

    const emailCount = await db.user.count({
      where: {
        email: data.email,
      },
    })
    const usernameCount = await db.user.count({
      where: {
        username: data.username,
      },
    })
    const errors: string[] = []
    if (emailCount) errors.push(emailError)
    if (usernameCount) errors.push(usernameError)

    if (errors.length) return c.json(errors, 400)

    return data
  }),
  async c => {
    const { password, ...val } = c.req.valid('json')
    await db.user.create({
      data: {
        ...val,
        password: await Bun.password.hash(password),
      },
    })

    return c.body(null, 204)
  },
)
