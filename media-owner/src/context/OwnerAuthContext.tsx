import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import * as authService from '@shared/services/authService'
import type { User } from '@shared/types/user'

interface OwnerAuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<string | null>
  signup: (email: string, password: string) => Promise<string | null>
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
  changePassword: (current: string, next: string) => Promise<string | null>
  refreshUser: () => void
}

const OwnerAuthContext = createContext<OwnerAuthContextValue | null>(null)

function postLoginNavigate(user: User, navigate: ReturnType<typeof useNavigate>) {
  if (!user.ownerProfileComplete) {
    navigate('/onboarding')
  } else {
    navigate('/dashboard')
  }
}

export function OwnerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
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
      const result = await authService.loginOwner(email, password)
      if (result.error) return result.error
      if (result.user!.role !== 'media_owner') {
        return 'Please use the advertiser portal for this account'
      }
      setUser(result.user!)
      postLoginNavigate(result.user!, navigate)
      return null
    },
    [navigate],
  )

  const signup = useCallback(
    async (email: string, password: string) => {
      const result = await authService.signupOwner(email, password)
      if (result.error) return result.error
      setUser(result.user!)
      navigate('/onboarding')
      return null
    },
    [navigate],
  )

  const logout = useCallback(() => {
    authService.clearSession()
    setUser(null)
    navigate('/login')
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

  return (
    <OwnerAuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
        refreshUser,
      }}
    >
      {children}
    </OwnerAuthContext.Provider>
  )
}

export function useOwnerAuth() {
  const ctx = useContext(OwnerAuthContext)
  if (!ctx) throw new Error('useOwnerAuth must be used within OwnerAuthProvider')
  return ctx
}
