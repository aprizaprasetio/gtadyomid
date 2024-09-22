import { describe, it, expect } from 'bun:test'
import type { z } from 'zod'
import { db } from '@src/clients/db.client'
import { auth } from '@src/clients/auth.client'
import { type loginSchema, type registerSchema, users } from './users.api'
import { registerUser, testUser } from '@src/../testSetup'

const newUser: z.infer<typeof registerSchema> = {
  email: 'new@example.com',
  username: 'newuser',
  password: 'newpassword123',
  displayName: 'New User',
}
async function loginScenario(label: string, user: z.infer<typeof loginSchema>) {
  it(label, async () => {
    const res = await users.request('/login', {
      method: 'POST',
      body: JSON.stringify(user),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    expect(res.status).toBe(204)
    expect(res.body).toBeNull()

    const sessionId = auth.readSessionCookie(res.headers.getSetCookie()[0])
    expect(sessionId).not.toBeNull()
    expect((await auth.validateSession(sessionId ?? '')).session).not.toBeNull()
    expect((await auth.validateSession(sessionId ?? '')).user).not.toBeNull()
  })
}

describe('POST /register', () => {
  it('should register a new user', async () => {
    const res = await registerUser(newUser)

    expect(res.status).toBe(204)

    // Verify user exists in the database
    const user = await db.user.findUnique({
      where: { email: newUser.email },
    })
    expect(user).not.toBeNull()
  })

  it('should not register a user with missing fields', async () => {
    const res = await registerUser({
      email: newUser.email,
    })

    expect(res.status).toBe(400)
    expect(await res.json()).toHaveProperty('issues')
  })
})

describe('POST /login', () => {
  loginScenario('should login a user with email from registered user', {
    identity: testUser.email,
    password: testUser.password,
  })
  loginScenario('should login a user with username from registered user', {
    identity: testUser.username,
    password: testUser.password,
  })
})
