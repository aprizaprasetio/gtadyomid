import { ZodError } from 'zod'

export const loginError = new ZodError([
  {
    code: 'custom',
    path: ['identity'],
    message: 'Email or username might be wrong',
  },
  {
    code: 'custom',
    path: ['password'],
    message: 'Password might be wrong',
  },
])
