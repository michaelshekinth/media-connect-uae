import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useOwnerAuth } from '../context/OwnerAuthContext'
import { setPendingRedirectPath } from './ProtectedRoute'
import { ADVERTISER_URL } from '@shared/constants/portals'

export function OwnerProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useOwnerAuth()
  const location = useLocation()

  useEffect(() => {
    if (!loading && !user) {
      setPendingRedirectPath(location.pathname + location.search)
    }
  }, [loading, user, location.pathname, location.search])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-800" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'media_owner') {
    window.location.href = ADVERTISER_URL
    return null
  }

  return <>{children}</>
}
