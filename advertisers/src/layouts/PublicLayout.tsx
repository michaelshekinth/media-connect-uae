import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AuthModal } from '../components/auth/AuthModal'
import { Footer } from '../components/layout/Footer'
import { Header } from '../components/layout/Header'
import { Toast } from '../components/ui/Toast'
import { useAuth } from '../context/AuthContext'

export function PublicLayout() {
  const [toast, setToast] = useState('')
  const { pathname } = useLocation()
  const { user } = useAuth()
  const headerVariant =
    user?.role === 'advertiser' &&
    (pathname.startsWith('/listing/') || pathname.startsWith('/agency/'))
      ? 'app'
      : 'landing'
  const contentOffset = pathname === '/' ? '' : 'pt-20'

  return (
    <div className="min-h-screen bg-slate-50">
      <Header variant={headerVariant} />
      <div className={contentOffset}>
        <Outlet context={{ showToast: setToast }} />
      </div>
      <Footer />
      <AuthModal />
      <Toast message={toast} visible={!!toast} onClose={() => setToast('')} />
    </div>
  )
}
