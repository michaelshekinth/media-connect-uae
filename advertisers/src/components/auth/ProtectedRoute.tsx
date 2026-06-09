import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const PENDING_KEY = 'mcuae_pending_redirect'

export function getPendingRedirect(): string | null {
  return sessionStorage.getItem(PENDING_KEY)
}

export function clearPendingRedirect() {
  sessionStorage.removeItem(PENDING_KEY)
}

export function setPendingRedirectPath(path: string) {
  sessionStorage.setItem(PENDING_KEY, path)
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (!loading && !user) {
      setPendingRedirectPath(location.pathname + location.search)
    }
  }, [loading, user, location.pathname, location.search])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    )
  }

  if (!user) {
    const loginPath = location.pathname.startsWith('/owner') ? '/owner/login' : '/login'
    return <Navigate to={loginPath} replace />
  }

  return <>{children}</>
}
