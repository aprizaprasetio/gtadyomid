import { validator } from 'hono/validator'
import { loginSchema } from '@app/users/commands/loginUser/loginUser.schema'
import { db } from '@infra/clients/db.client'
import { loginError } from '@app/users/commands/loginUser/loginUser.error'
import { auth } from '@app/common/clients/auth.client'
import { factory } from '@app/common/clients/factory.client'

export const loginUser = factory.createHandlers(
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
