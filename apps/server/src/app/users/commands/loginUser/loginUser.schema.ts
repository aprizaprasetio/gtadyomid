import { type } from 'arktype'

export const loginSchema = type({
  identity: 'string',
  password: 'string',
})

export const findUserSchema = type({
  identity: 'string',
  password: 'string',
})
