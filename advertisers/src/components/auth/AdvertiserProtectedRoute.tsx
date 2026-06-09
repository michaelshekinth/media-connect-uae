import { MEDIA_OWNER_LOGIN_URL } from '@shared/constants/portals'
import { useAuth } from '../../context/AuthContext'
import { ProtectedRoute } from './ProtectedRoute'

export function AdvertiserProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    )
  }

  if (user?.role === 'media_owner') {
    window.location.href = MEDIA_OWNER_LOGIN_URL
    return null
  }

  return <ProtectedRoute>{children}</ProtectedRoute>
}
