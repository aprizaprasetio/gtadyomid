import { password } from 'bun'
import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { z, ZodError, type ZodIssue } from 'zod'
import { db } from '@src/clients/db.client'

const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  username: z.string().toLowerCase(),
  displayName: z.string().nullish(),
  password: z.string(),
})

export const users = new Hono()

users.post(
  '/register',
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

    if (emailCount || usernameCount) {
      const emailIssues: ZodIssue[] = emailCount
        ? [
            {
              code: 'custom',
              path: ['email'],
              message: 'Email is already registered',
            },
          ]
        : []
      const usernameIssues: ZodIssue[] = emailCount
        ? [
            {
              code: 'custom',
              path: ['username'],
              message: 'Username is already registered',
            },
          ]
        : []

      return c.json(new ZodError([...emailIssues, ...usernameIssues]), 400)
    }

    return data
  }),
  async c => {
    const { password: rawPassword, ...val } = c.req.valid('json')

    await db.user.create({
      data: {
        ...val,
        hashedPassword: await password.hash(rawPassword),
      },
    })

    return c.body(null, 204)
  },
)
