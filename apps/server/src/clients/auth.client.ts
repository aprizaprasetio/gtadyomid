import { PrismaAdapter } from '@lucia-auth/adapter-prisma'
import { Lucia } from 'lucia'
import { db } from './db.client'

declare module 'lucia' {
  interface Register {
    UserId: number
  }
}

const authAdapter = new PrismaAdapter(db.session, db.user)

export const auth = new Lucia(authAdapter)
