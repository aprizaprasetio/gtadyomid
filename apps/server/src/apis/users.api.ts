import { password } from 'bun'
import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { z, ZodError, type ZodIssue } from 'zod'
import { auth } from '@src/clients/auth.client'
import { db } from '@src/clients/db.client'

export const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  username: z.string().toLowerCase(),
  displayName: z.string().nullish(),
  password: z.string(),
})
export const loginSchema = z.object({
  identity: z.string().toLowerCase(),
  password: z.string(),
})
export const cookieSchema = z.object({
  auth_session: z.string().nullish(),
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

users.post(
  '/login',
  validator('json', async (val, c) => {
    const { error, data } = await loginSchema.safeParseAsync(val)
    if (error) return c.json(error, 400)

    const user = await db.user.findFirst({
      where: {
        OR: [
          {
            email: data.identity,
          },
          { username: data.identity },
        ],
      },
      select: {
        id: true,
        hashedPassword: true,
      },
    })

    const loginError = new ZodError([
      {
        code: 'custom',
        path: ['identity'],
        message: 'Email or username might be wrong',
      },
      {
        code: 'custom',
        path: ['password'],
        message: 'Password might be wrong',
      },
    ])

    if (!user) return c.json(loginError, 400)

    const isVerified = await password.verify(data.password, user.hashedPassword)

    if (isVerified) return user.id

    return c.json(loginError, 400)
  }),
  async c => {
    const userId = c.req.valid('json')
    const session = await auth.createSession(userId, {})
    const sessionCookie = auth.createSessionCookie(session.id)

    c.header('Set-Cookie', sessionCookie.serialize())

    return c.body(null, 204)
  },
)

users.post(
  '/logout',
  validator('cookie', async (val, c) => {
    const { error, data } = await cookieSchema.safeParseAsync(val)
    if (error || !data.auth_session) return c.json(error, 400)

    return data.auth_session
  }),
  async c => {
    const sessionId = c.req.valid('cookie')
    const sessionCookie = auth.createBlankSessionCookie()

    await auth.invalidateSession(sessionId)
    c.header('Set-Cookie', sessionCookie.serialize())

    return c.body(null, 204)
  },
)
