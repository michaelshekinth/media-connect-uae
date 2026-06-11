import { URLS } from './credentials'

type AuthRole = 'advertiser' | 'media_owner' | 'super_admin'

const LOGIN_PATHS: Record<AuthRole, string> = {
  advertiser: '/api/auth/advertiser/login',
  media_owner: '/api/auth/owner/login',
  super_admin: '/api/auth/admin/login',
}

export async function apiLogin(
  baseUrl: string,
  role: AuthRole,
  email: string,
  password: string,
): Promise<string> {
  const res = await fetch(`${baseUrl}${LOGIN_PATHS[role]}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Login failed (${role}): ${(err as { error?: string }).error ?? res.statusText}`)
  }
  const data = (await res.json()) as { token: string }
  return data.token
}

export async function apiFetch<T>(
  baseUrl: string,
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json')
  headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(`${baseUrl}${path}`, { ...init, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`API ${path}: ${(err as { error?: string }).error ?? res.statusText}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function waitForHealth(baseUrl: string, maxWaitMs = 30_000): Promise<void> {
  const start = Date.now()
  let lastError = ''
  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch(`${baseUrl}/api/health`)
      if (res.ok) {
        const data = (await res.json()) as { ok?: boolean }
        if (data.ok) return
      }
      lastError = `status ${res.status}`
    } catch (e) {
      lastError = e instanceof Error ? e.message : 'unknown'
    }
    await new Promise((r) => setTimeout(r, 2000))
  }
  throw new Error(`API health check failed after ${maxWaitMs}ms: ${lastError}`)
}

export { URLS }
