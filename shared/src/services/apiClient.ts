const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''
const API = API_BASE ? `${API_BASE}/api` : '/api'

export type TokenRole = 'advertiser' | 'media_owner' | 'super_admin'

const TOKEN_KEYS: Record<TokenRole, string> = {
  advertiser: 'mcuae_token_advertiser',
  media_owner: 'mcuae_token_owner',
  super_admin: 'mcuae_token_admin',
}

export function getToken(role: TokenRole): string | null {
  return localStorage.getItem(TOKEN_KEYS[role])
}

export function setToken(role: TokenRole, token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEYS[role], token)
  else localStorage.removeItem(TOKEN_KEYS[role])
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { role?: TokenRole; auth?: boolean } = {},
): Promise<T> {
  const { role, auth = true, ...init } = options
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }
  if (auth && role) {
    const token = getToken(role)
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }
  const res = await fetch(`${API}${path}`, { ...init, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new ApiError(res.status, err.error ?? 'Request failed')
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
