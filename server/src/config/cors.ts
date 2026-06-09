const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://media-connect-uae.vercel.app',
  'https://media-owner.vercel.app',
  'https://super-admin.vercel.app',
]

export function getCorsOrigins(): string[] {
  const extra = process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean) ?? []
  return [...new Set([...DEFAULT_ORIGINS, ...extra])]
}
