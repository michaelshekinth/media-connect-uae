/** Each portal runs as its own Vite app in development. */
export const ADVERTISER_URL =
  import.meta.env.VITE_ADVERTISER_URL ?? 'http://localhost:5173'

export const ADVERTISER_LOGIN_URL = `${ADVERTISER_URL}/login`

export const MEDIA_OWNER_URL =
  import.meta.env.VITE_MEDIA_OWNER_URL ?? 'http://localhost:5175'

export const MEDIA_OWNER_LOGIN_URL = `${MEDIA_OWNER_URL}/login`

export const ADMIN_URL =
  import.meta.env.VITE_ADMIN_URL ?? 'http://localhost:5174'

export const ADMIN_LOGIN_URL = `${ADMIN_URL}/login`
