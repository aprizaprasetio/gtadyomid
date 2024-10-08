import { Hono } from 'hono'
import type { Session } from 'lucia'
import { users } from './apis/users.api'

declare module 'hono' {
  interface ContextVariableMap {
    session: Session | null
  }
}

const app = new Hono()

app.route('/users', users)

export default app
