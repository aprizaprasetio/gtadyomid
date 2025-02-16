import sharp = require('sharp')

export async function resizeImage(image: File, width: number) {
  const imageArrayBuffer = await image.arrayBuffer()
  return sharp(imageArrayBuffer).resize(width).webp().toBuffer()
}
