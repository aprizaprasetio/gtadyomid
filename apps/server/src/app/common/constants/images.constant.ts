import type { MissionImage } from '@prisma/client'

export const allowedImageTypes = ['image/webp', 'image/png']

export const allowedImageExtensions = ['webp', 'png']

export const allowedImageSize = 1_048_576

export const imageVariants = {
  high: 1_920,
  medium: 480,
  small: 360,
}

export const s3ImageFolder = 'images'

export type StoredImagePath = Pick<
  MissionImage,
  'highPath' | 'mediumPath' | 'smallPath'
>
