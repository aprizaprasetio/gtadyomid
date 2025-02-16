import { z } from 'zod'

export const loginSchema = z.object({
  identity: z.string().toLowerCase(),
  password: z.string(),
})
