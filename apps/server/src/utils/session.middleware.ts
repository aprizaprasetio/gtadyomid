import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { auth } from '@src/clients/auth.client'

export const sessionMiddleware = createMiddleware(async (c, next) => {
  const sessionId = getCookie(c, auth.sessionCookieName) ?? null

  if (!sessionId) {
    c.set('session', null)
    return next()
  }

  const { session } = await auth.validateSession(sessionId)

  if (session?.fresh) {
    c.header('Set-Cookie', auth.createSessionCookie(session.id).serialize(), {
      append: true,
    })
  }

  if (!session) {
    c.header('Set-Cookie', auth.createBlankSessionCookie().serialize(), {
      append: true,
    })
  }

  c.set('session', session)

  return next()
})
