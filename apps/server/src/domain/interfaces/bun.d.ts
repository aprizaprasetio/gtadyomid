declare module 'bun' {
  interface Env {
    DATABASE_URL: string
    S3_ACCESS: string
    S3_SECRET: string
    S3_BUCKET: string
    S3_URL: string
  }
}
