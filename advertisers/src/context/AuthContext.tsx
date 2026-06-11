import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  clearPendingRedirect,
  getPendingRedirect,
} from '../components/auth/ProtectedRoute'
import * as authService from '@shared/services/authService'
import type { User } from '@shared/types/user'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<string | null>
  signup: (
    email: string,
    password: string,
    fields?: authService.AdvertiserSignupFields,
  ) => Promise<string | null>
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
  changePassword: (current: string, next: string) => Promise<string | null>
  deleteAccount: () => Promise<void>
  openAuth: (mode: 'login' | 'signup') => void
  authMode: 'login' | 'signup' | null
  closeAuth: () => void
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function postLoginNavigate(navigate: ReturnType<typeof useNavigate>) {
  const redirect = getPendingRedirect()
  if (redirect) {
    clearPendingRedirect()
    navigate(redirect)
    return
  }
  navigate('/browse')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null)
  const navigate = useNavigate()

  const refreshUser = useCallback(() => {
    setUser(authService.getSession())
  }, [])

  useEffect(() => {
    authService.refreshSession().then((u) => {
      setUser(u ?? authService.getSession())
      setLoading(false)
    })
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authService.loginAdvertiser(email, password)
      if (result.error) return result.error
      if (result.user!.role === 'media_owner') {
        return 'Please use the Media Owner portal for this account'
      }
      setUser(result.user!)
      setAuthMode(null)
      postLoginNavigate(navigate)
      return null
    },
    [navigate],
  )

  const signup = useCallback(
    async (
      email: string,
      password: string,
      fields?: authService.AdvertiserSignupFields,
    ) => {
      const result = await authService.signupAdvertiser(email, password, fields)
      if (result.error) return result.error
      setUser(result.user!)
      setAuthMode(null)
      postLoginNavigate(navigate)
      return null
    },
    [navigate],
  )

  const logout = useCallback(() => {
    authService.clearSession()
    setUser(null)
    navigate('/')
  }, [navigate])

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    const updated = await authService.updateUser(updates)
    if (updated) setUser(updated)
  }, [])

  const changePassword = useCallback(async (current: string, next: string) => {
    const result = await authService.changePassword(current, next)
    if (!result.ok) return result.error ?? 'Failed'
    const updated = authService.getSession()
    if (updated) setUser(updated)
    return null
  }, [])

  const deleteAccount = useCallback(async () => {
    await authService.deleteAccount()
    setUser(null)
    navigate('/')
  }, [navigate])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
        openAuth: setAuthMode,
        authMode,
        closeAuth: () => setAuthMode(null),
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
