import { Hono } from 'hono'
import { users } from './apis/users.api'

const app = new Hono()

app.route('/users', users)

export default app
