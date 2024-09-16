import { afterAll, beforeEach } from 'bun:test'
import { db } from './src/clients/db.client'

beforeEach(async () => {
  // Clean the test database before each test
  await db.user.deleteMany({})
})

afterAll(async () => {
  console.info('anjay')
  await db.$disconnect()
})
