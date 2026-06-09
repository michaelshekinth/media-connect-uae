import { Outlet } from 'react-router-dom'
import { AuthModal } from '../components/auth/AuthModal'
import { Footer } from '../components/layout/Footer'
import { Header } from '../components/layout/Header'
import { Toast } from '../components/ui/Toast'
import { useState } from 'react'

export function AppLayout() {
  const [toast, setToast] = useState('')

  return (
    <div className="min-h-screen bg-slate-50">
      <Header variant="app" />
      <div className="pt-20">
        <Outlet context={{ showToast: setToast }} />
      </div>
      <Footer />
      <AuthModal />
      <Toast message={toast} visible={!!toast} onClose={() => setToast('')} />
    </div>
  )
}
