import { afterAll, beforeAll } from 'bun:test'
import type { z } from 'zod'
import { db } from './src/clients/db.client'
import {
  type loginSchema,
  type registerSchema,
  users,
} from './src/apis/users.api'

export const ichigoUser: z.infer<typeof registerSchema> = {
  email: 'ichigo@example.com',
  username: 'ichigouser',
  password: 'ichigopassword123',
  displayName: 'ichigo User',
}

export function registerUser(user: Partial<z.infer<typeof registerSchema>>) {
  return users.request('/register', {
    method: 'POST',
    body: JSON.stringify(user),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export function loginUser(user: Partial<z.infer<typeof loginSchema>>) {
  return users.request('/login', {
    method: 'POST',
    body: JSON.stringify(user),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

beforeAll(async () => {
  await registerUser(ichigoUser)
})

afterAll(async () => {
  await db.user.deleteMany()
  await db.$disconnect()
})
