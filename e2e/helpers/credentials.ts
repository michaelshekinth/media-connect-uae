export const TEST_CREDENTIALS = {
  admin: { email: 'admin@mediaconnect.ae', password: 'admin123' },
  advertiser: { email: 'test.advertiser@media.ae', password: 'TestMedia2026!' },
  owner: { email: 'test.owner@media.ae', password: 'TestMedia2026!' },
} as const

export const URLS = {
  api: process.env.API_URL ?? 'http://localhost:4000',
  apiProduction: process.env.API_URL_PRODUCTION ?? 'https://media-connect-uae.onrender.com',
  advertiser: process.env.ADVERTISER_URL ?? 'http://localhost:5173',
  advertiserProduction: process.env.ADVERTISER_URL_PRODUCTION ?? 'https://media-connect-uae.vercel.app',
  owner: process.env.MEDIA_OWNER_URL ?? 'http://localhost:5175',
  ownerProduction: process.env.MEDIA_OWNER_URL_PRODUCTION ?? 'https://media-owner.vercel.app',
  admin: process.env.ADMIN_URL ?? 'http://localhost:5174',
  adminProduction: process.env.ADMIN_URL_PRODUCTION ?? 'https://super-admin-seven-beta.vercel.app',
} as const

export const DEMO_OWNER_AGENCY_ID = 'agency_demo_test_owner'
