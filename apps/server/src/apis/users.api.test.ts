import { describe, it, expect } from 'bun:test'
import { db } from '@src/clients/db.client'
import { users } from './users.api'

describe('POST /register', () => {
  it('should register a new user', async () => {
    const res = await users.request('/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        displayName: 'Test User',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    expect(res.status).toBe(204)

    // Verify user exists in the database
    const user = await db.user.findUnique({
      where: { email: 'test@example.com' },
    })
    expect(user).not.toBeNull()
  })

  it('should not register a user with missing fields', async () => {
    const res = await users.request('/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    expect(res.status).toBe(400)
    expect(await res.json()).toHaveProperty('issues')
  })
})
