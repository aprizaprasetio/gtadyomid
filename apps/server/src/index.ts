import { Hono } from 'hono'
import type { Session } from 'lucia'
import { users } from './apis/users.api'
import { sessionMiddleware } from './utils/session.middleware'

declare module 'hono' {
  interface ContextVariableMap {
    session: Session | null
  }
}

const app = new Hono().use(sessionMiddleware)

app.route('/users', users)

export default app
