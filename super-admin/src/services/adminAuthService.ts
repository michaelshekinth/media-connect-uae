import { apiFetch, setToken, getToken } from '@shared/services/apiClient'

export interface AdminSession {
  email: string
  name: string
  role: 'super_admin'
}

const SESSION_KEY = 'mcuae_admin_session'

export function getAdminSession(): AdminSession | null {
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw || !getToken('super_admin')) return null
  try {
    return JSON.parse(raw) as AdminSession
  } catch {
    return null
  }
}

export async function adminLogin(email: string, password: string): Promise<{ session?: AdminSession; error?: string }> {
  try {
    const data = await apiFetch<{ token: string; session: AdminSession }>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      auth: false,
    })
    setToken('super_admin', data.token)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data.session))
    return { session: data.session }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Invalid admin credentials' }
  }
}

export function adminLogout() {
  sessionStorage.removeItem(SESSION_KEY)
  setToken('super_admin', null)
}
