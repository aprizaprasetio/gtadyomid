import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  username: z.string().toLowerCase(),
  displayName: z.string().nullish(),
  password: z.string(),
})
