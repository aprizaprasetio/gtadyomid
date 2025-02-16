import { loginUser } from '@src/app/users/commands/loginUser/loginUser.command'
import { registerUser } from '@src/app/users/commands/registerUser/registerUser.command'
import { logoutUser } from '@src/app/users/commands/logoutUser/logoutUser.command'
import { Hono } from 'hono'

export const users = new Hono()

users.post('/login', ...loginUser)

users.post('/register', ...registerUser)

users.post('/logout', ...logoutUser)
