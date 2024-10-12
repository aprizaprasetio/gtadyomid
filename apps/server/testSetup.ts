import { afterAll, beforeAll } from 'bun:test'
import type { z } from 'zod'
import app from './src'
import { db } from './src/clients/db.client'
import type { loginSchema, registerSchema } from './src/apis/users.api'

export const ichigoUser: z.infer<typeof registerSchema> = {
  email: 'ichigo@example.com',
  username: 'ichigouser',
  password: 'ichigopassword123',
  displayName: 'Ichigo User',
}
export const nigoUser: z.infer<typeof registerSchema> = {
  email: 'nigo@example.com',
  username: 'nigouser',
  password: 'nigopassword123',
  displayName: 'Nigo User',
}
export let nigoUserCookie = ''

export async function registerUser(
  user: Partial<z.infer<typeof registerSchema>>,
) {
  return app.request('/users/register', {
    method: 'POST',
    body: JSON.stringify(user),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export function loginUser(user: Partial<z.infer<typeof loginSchema>>) {
  return app.request('users/login', {
    method: 'POST',
    body: JSON.stringify(user),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

beforeAll(async () => {
  await registerUser(ichigoUser)
  await registerUser(nigoUser).then(async () => {
    const login = await loginUser({
      identity: ichigoUser.email,
      password: ichigoUser.password,
    })

    nigoUserCookie = login.headers.getSetCookie()[0]
  })
})

afterAll(async () => {
  await db.user.deleteMany({})
  await db.$disconnect()
})
