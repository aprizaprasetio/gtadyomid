import { auth } from '@app/common/clients/auth.client'
import { factory } from '@app/common/clients/factory.client'
import { authValidator } from '@app/common/validators/auth.validator'

export const logoutUser = factory.createHandlers(authValidator, async c => {
  const { session } = c.req.valid('cookie')
  const sessionCookie = auth.createBlankSessionCookie()
  await auth.invalidateSession(session.id)
  c.header('Set-Cookie', sessionCookie.serialize())

  return c.body(null, 204)
})
