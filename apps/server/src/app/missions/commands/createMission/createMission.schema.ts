import { type } from 'arktype'
import { imageSchema } from '@app/common/schemas/images.schema'

export const missionSchema = type({
  title: 'string',
  description: 'string',
  images: imageSchema.array(),
})
