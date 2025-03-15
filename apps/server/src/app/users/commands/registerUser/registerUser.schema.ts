import { type } from 'arktype'

export const registerSchema = type({
  email: 'string.email',
  username: 'string.alphanumeric',
  displayName: 'string',
  password: 'string',
})
