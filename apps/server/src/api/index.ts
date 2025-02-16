import { Hono } from 'hono'
import { sessionMiddleware } from '@app/common/middlewares/session.middleware'
import { users } from '@api/endpoints/users'
import { missions } from '@api/endpoints/missions'

const app = new Hono().use(sessionMiddleware)

app.route('/users', users)
app.route('/missions', missions)

export default app
