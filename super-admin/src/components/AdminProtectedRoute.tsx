import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAdminAuth()
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}
