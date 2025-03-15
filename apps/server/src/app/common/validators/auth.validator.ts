import { validator } from 'hono/validator'
import { db } from '@infra/clients/db.client'
import { sessionError } from '@app/common/constants/auth.constant'

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
