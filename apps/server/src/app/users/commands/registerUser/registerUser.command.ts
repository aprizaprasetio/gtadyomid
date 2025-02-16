import { validator } from 'hono/validator'
import { registerSchema } from '@src/app/users/commands/registerUser/registerUser.schema'
import { ZodError, type ZodIssue } from 'zod'
import {
  emailIssue,
  usernameIssue,
} from '@src/app/users/commands/registerUser/registerUser.error'
import { db } from '@infra/clients/db.client'
import { factory } from '@app/common/clients/factory.client'

export const registerUser = factory.createHandlers(
  validator('json', async (val, c) => {
    const { error, data } = await registerSchema.safeParseAsync(val)
    if (error) return c.json(error, 400)

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
    const issues: ZodIssue[] = []
    if (emailCount) issues.push(emailIssue)
    if (usernameCount) issues.push(usernameIssue)

    if (issues.length) return c.json(new ZodError(issues), 400)

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
