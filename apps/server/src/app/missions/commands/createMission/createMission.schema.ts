import {
  allowedImageExtensions,
  allowedImageSize,
  allowedImageTypes,
} from '@app/common/constants/images.constant'
import { zfd } from 'zod-form-data'

export const missionSchema = zfd.formData({
  title: zfd.text(),
  description: zfd.text(),
  images: zfd.repeatableOfType(
    zfd
      .file()
      .refine(
        file => {
          const isValidType = allowedImageTypes.includes(file.type)
          let isValidExtension = false

          for (let i = 0; i < allowedImageExtensions.length; i++) {
            if (file.name.endsWith(allowedImageExtensions[i])) {
              isValidExtension = true
              break
            }
          }

          return isValidType && isValidExtension
        },
        {
          message: `Image should be ${allowedImageExtensions.join(' or ')}`,
        },
      )
      .refine(image => image.size <= allowedImageSize, {
        message: 'Image should be less than 1MB',
      }),
  ),
})
