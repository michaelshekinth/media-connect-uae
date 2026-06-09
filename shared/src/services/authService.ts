import type { User } from '@shared/types/user'
import { apiFetch, setToken } from './apiClient'

const SESSION_KEY = 'mcuae_user'

function saveSession(user: User | null) {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  else localStorage.removeItem(SESSION_KEY)
}

export function getSession(): User | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export async function loginAdvertiser(email: string, password: string): Promise<{ user?: User; error?: string }> {
  try {
    const data = await apiFetch<{ token: string; user: User }>('/auth/advertiser/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      auth: false,
    })
    setToken('advertiser', data.token)
    saveSession(data.user)
    return { user: data.user }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Login failed' }
  }
}

export async function signupAdvertiser(email: string, password: string): Promise<{ user?: User; error?: string }> {
  try {
    const data = await apiFetch<{ token: string; user: User }>('/auth/advertiser/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      auth: false,
    })
    setToken('advertiser', data.token)
    saveSession(data.user)
    return { user: data.user }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Signup failed' }
  }
}

export async function loginOwner(email: string, password: string): Promise<{ user?: User; error?: string }> {
  try {
    const data = await apiFetch<{ token: string; user: User }>('/auth/owner/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      auth: false,
    })
    setToken('media_owner', data.token)
    saveSession(data.user)
    return { user: data.user }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Login failed' }
  }
}

export async function signupOwner(email: string, password: string): Promise<{ user?: User; error?: string }> {
  try {
    const data = await apiFetch<{ token: string; user: User }>('/auth/owner/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      auth: false,
    })
    setToken('media_owner', data.token)
    saveSession(data.user)
    return { user: data.user }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Signup failed' }
  }
}

export function login(email: string, password: string) {
  return loginAdvertiser(email, password)
}

export function signupAdvertiserSync(email: string, password: string) {
  return signupAdvertiser(email, password)
}

export async function refreshSession(): Promise<User | null> {
  const session = getSession()
  if (!session) return null
  const role = session.role === 'media_owner' ? 'media_owner' : 'advertiser'
  try {
    const data = await apiFetch<{ user: User }>('/auth/me', { role })
    saveSession(data.user)
    return data.user
  } catch {
    clearSession()
    return null
  }
}

export function clearSession() {
  saveSession(null)
  setToken('advertiser', null)
  setToken('media_owner', null)
}

export async function updateUser(updates: Partial<User>): Promise<User | null> {
  const session = getSession()
  if (!session) return null
  const role = session.role === 'media_owner' ? 'media_owner' : 'advertiser'
  const path = role === 'media_owner' ? '/owner/profile' : '/advertiser/profile'
  const data = await apiFetch<User>(path, { method: 'PATCH', body: JSON.stringify(updates), role })
  saveSession(data)
  return data
}

export async function changePassword(_current: string, _next: string): Promise<{ ok: boolean; error?: string }> {
  return { ok: false, error: 'Password change not implemented yet' }
}

export async function deleteAccount(): Promise<void> {
  clearSession()
}

export function updateMediaOwnerByAgencyId(agencyId: string, updates: Partial<User>): boolean {
  const session = getSession()
  if (!session || session.agencyId !== agencyId) return false
  saveSession({ ...session, ...updates })
  return true
}
