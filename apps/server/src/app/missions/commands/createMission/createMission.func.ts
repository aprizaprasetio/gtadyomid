import { resizeImage } from '@app/common/utils/resizeImage.util'
import { storeImageS3 } from '@app/common/utils/storeImageS3.util'
import {
  imageVariants,
  type StoredImagePath,
} from '@app/common/constants/images.constant'

export async function storeMissionImage(
  name: string,
  image: File,
): Promise<StoredImagePath> {
  const high = await resizeImage(image, imageVariants.high)
  const medium = await resizeImage(image, imageVariants.medium)
  const small = await resizeImage(image, imageVariants.small)

  return {
    highPath: await storeImageS3(name, high),
    mediumPath: await storeImageS3(name, medium),
    smallPath: await storeImageS3(name, small),
  }
}
