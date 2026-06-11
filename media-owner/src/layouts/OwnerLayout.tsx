import { Bell, Building2, ChevronDown, LogOut } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Toast } from '../components/ui/Toast'
import { useOwnerAuth } from '../context/OwnerAuthContext'
import { getUnreadOwnerNotificationCount } from '../services/ownerStore'

export function OwnerLayout() {
  const { user, logout } = useOwnerAuth()
  const navigate = useNavigate()
  const [toast, setToast] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    if (!user?.agencyId) return
    getUnreadOwnerNotificationCount(user.agencyId).then(setNotifCount)
    const interval = setInterval(() => {
      getUnreadOwnerNotificationCount(user.agencyId!).then(setNotifCount)
    }, 10000)
    return () => clearInterval(interval)
  }, [user?.agencyId])
  const isApproved = user?.ownerApprovalStatus === 'approved'

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/dashboard/chats" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900">Publisher</span>
              {user?.companyName && (
                <p className="text-xs text-slate-500">{user.companyName}</p>
              )}
            </div>
            {isApproved && (
              <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Verified</span>
            )}
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              to="/dashboard/notifications"
              className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              <Bell className="h-5 w-5" />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                  {notifCount}
                </span>
              )}
            </Link>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">
                  {user?.fullName?.charAt(0).toUpperCase() ?? 'O'}
                </div>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                  <p className="border-b border-slate-100 px-4 py-2 text-xs text-slate-500">{user?.email}</p>
                  <button type="button" onClick={() => { setMenuOpen(false); navigate('/dashboard/company-profile') }}
                    className="flex w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                    Company profile
                  </button>
                  <button type="button" onClick={() => { setMenuOpen(false); navigate('/purchases') }}
                    className="flex w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                    Purchases & upgrades
                  </button>
                  <button type="button" onClick={() => { setMenuOpen(false); logout() }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <div className="pt-16">
        <Outlet context={{ showToast: setToast }} />
      </div>

      <Toast message={toast} visible={!!toast} onClose={() => setToast('')} />
    </div>
  )
}
