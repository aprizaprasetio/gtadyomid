import { Hono } from 'hono'
import type { Session } from 'lucia'
import { users } from './apis/users.api'
import { missions } from './apis/missions.api'
import { sessionMiddleware } from './utils/session.middleware'

declare module 'bun' {
  interface Env {
    DATABASE_URL: string
    S3_ACCESS: string
    S3_SECRET: string
    S3_BUCKET: string
    S3_URL: string
  }
}

declare module 'hono' {
  interface ContextVariableMap {
    session: Session | null
  }
}

const app = new Hono().use(sessionMiddleware)

app.route('/users', users)
app.route('/missions', missions)

export default app
