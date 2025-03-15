import { type } from 'arktype'
import {
  allowedImageExtensions,
  allowedImageSize,
  allowedImageTypes,
  imageExtensionExpected,
  imageSizeExpected,
} from '@app/common/constants/images.constant'

export const imageSchema = type('File')
  .narrow((file, ctx) => {
    const isValidType = allowedImageTypes.includes(file.type)
    let isValidExtension = false

    for (let i = 0; i < allowedImageExtensions.length; i++) {
      if (file.name.endsWith(allowedImageExtensions[i])) {
        isValidExtension = true
        break
      }
    }

    if (isValidType && isValidExtension) return true

    return ctx.mustBe(imageExtensionExpected)
  })
  .narrow((file, ctx) => {
    if (file.size <= allowedImageSize) return true

    return ctx.mustBe(imageSizeExpected)
  })
