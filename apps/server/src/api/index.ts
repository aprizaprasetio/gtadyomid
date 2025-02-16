import { Hono } from 'hono'
import { users } from '@api/endpoints/users'
import { missions } from '@app/missions/missions.api'
import { sessionMiddleware } from '@app/common/middlewares/session.middleware'

const app = new Hono().use(sessionMiddleware)

app.route('/users', users)
app.route('/missions', missions)

export default app
