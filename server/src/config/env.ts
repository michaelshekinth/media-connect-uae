import 'dotenv/config'

export const env = {
  port: Number(process.env.PORT ?? process.env.API_PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-jwt-secret-change-me',
  mongoUri: process.env.MONGODB_URI ?? '',
}
