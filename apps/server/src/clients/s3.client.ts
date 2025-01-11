export const s3 = new Bun.S3Client({
  accessKeyId: Bun.env.S3_ACCESS,
  secretAccessKey: Bun.env.S3_SECRET,
  bucket: Bun.env.S3_BUCKET,
  endpoint: Bun.env.S3_URL,
})
