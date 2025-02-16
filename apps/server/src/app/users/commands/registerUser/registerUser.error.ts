import type { ZodIssue } from 'zod'

export const emailIssue: ZodIssue = {
  code: 'custom',
  path: ['email'],
  message: 'Email is already registered',
}

export const usernameIssue: ZodIssue = {
  code: 'custom',
  path: ['username'],
  message: 'Username is already registered',
}
