import { nanoid } from 'nanoid'
import { s3ImageFolder } from '@app/common/constants/images.constant'
import { s3 } from '@infra/clients/s3.client'

export async function storeImageS3(name: string, image: Buffer) {
  const path = `${s3ImageFolder}/${name}-${nanoid(10)}.webp`
  await s3.file(path).write(image)

  return path
}
