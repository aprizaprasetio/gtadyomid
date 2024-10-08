import { validator } from 'hono/validator'
import { ZodError } from 'zod'
import { auth } from '@src/clients/auth.client'
import { db } from '@src/clients/db.client'

export const sessionError = new ZodError([
  {
    code: 'custom',
    path: [auth.sessionCookieName],
    message: 'Session is invalid',
  },
])

export const authValidator = validator('cookie', (_, c) => {
  const session = c.get('session')
  const getUser = () =>
    db.user.findUnique({
      where: {
        id: session?.userId,
      },
    })

  if (session) return { getUser, session }

  return c.json(sessionError, 401)
})
