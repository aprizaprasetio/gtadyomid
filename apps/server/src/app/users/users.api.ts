import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { z, ZodError, type ZodIssue } from 'zod'
import { auth } from '@src/app/common/clients/auth.client'
import { db } from '@src/infra/clients/db.client'
import { authValidator } from '@src/app/common/validators/auth.validator'

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
const emailIssue: ZodIssue = {
  code: 'custom',
  path: ['email'],
  message: 'Email is already registered',
}
const usernameIssue: ZodIssue = {
  code: 'custom',
  path: ['username'],
  message: 'Username is already registered',
}
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
          {
            username: data.identity,
          },
        ],
      },
      select: {
        id: true,
        password: true,
      },
    })

    if (!user) return c.json(loginError, 400)

    const isVerified = await Bun.password.verify(data.password, user.password)
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

users.post('/logout', authValidator, async c => {
  const { session } = c.req.valid('cookie')
  const sessionCookie = auth.createBlankSessionCookie()
  await auth.invalidateSession(session.id)
  c.header('Set-Cookie', sessionCookie.serialize())

  return c.body(null, 204)
})
