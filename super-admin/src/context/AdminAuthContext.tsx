import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { adminLogin, adminLogout, getAdminSession, type AdminSession } from '../services/adminAuthService'

interface AdminAuthContextValue {
  session: AdminSession | null
  login: (email: string, password: string) => Promise<string | null>
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(() => getAdminSession())

  const login = useCallback(async (email: string, password: string) => {
    const result = await adminLogin(email, password)
    if (result.error) return result.error
    setSession(result.session!)
    return null
  }, [])

  const logout = useCallback(() => {
    adminLogout()
    setSession(null)
  }, [])

  return (
    <AdminAuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
