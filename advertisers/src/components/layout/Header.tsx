import { Bell, ChevronDown, Crown, LayoutDashboard, LogOut, Megaphone, Shield, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ADMIN_LOGIN_URL, MEDIA_OWNER_LOGIN_URL } from '@shared/constants/portals'
import { useAuth } from '../../context/AuthContext'
import { getPendingQuoteCount, getSubscription, getUnreadChatCount, getUnreadNotificationCount } from '../../services/userStore'

interface HeaderProps {
  variant?: 'landing' | 'app'
}

export function Header({ variant = 'landing' }: HeaderProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const isLanding = variant === 'landing' && location.pathname === '/'
  const showAdminLink = location.pathname !== '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    if (!user || user.role !== 'advertiser') return
    const load = async () => {
      const [q, c, n] = await Promise.all([
        getPendingQuoteCount(),
        getUnreadChatCount(),
        getUnreadNotificationCount(),
      ])
      setNotifCount(q + c + n)
    }
    load()
    const interval = setInterval(load, 10000)
    return () => clearInterval(interval)
  }, [user])
  const subscription = user?.role === 'advertiser' ? getSubscription() : null

  const glass = scrolled || !isLanding

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
        glass ? 'header-glass border-b border-white/30 shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-orange-500 shadow-md">
            <Megaphone className="h-5 w-5 text-white" />
          </div>
          <span className={`text-lg font-bold tracking-tight ${glass ? 'text-slate-900' : 'text-white'}`}>
            MediaConnect UAE
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          {user && user.role === 'advertiser' && (
            <>
              <Link
                to="/browse"
                className={`hidden rounded-lg px-3 py-2 text-sm font-medium sm:inline-flex ${
                  glass ? 'text-slate-700 hover:bg-slate-100' : 'text-white/90 hover:bg-white/10'
                }`}
              >
                Browse
              </Link>
              <Link
                to="/subscription"
                className="hidden items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 sm:inline-flex"
                title="Subscription"
              >
                <Crown className="h-4 w-4" />
                {subscription ? subscription.packageName : 'Subscribe'}
              </Link>
              <Link
                to="/dashboard"
                className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                    {notifCount}
                  </span>
                )}
              </Link>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm hover:shadow-md"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                    <p className="border-b border-slate-100 px-4 py-2 text-xs text-slate-500">{user.email}</p>
                    <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    <button type="button" onClick={() => { setMenuOpen(false); logout() }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {user && user.role === 'media_owner' && (
            <a href={MEDIA_OWNER_LOGIN_URL}
              className={`rounded-lg px-3 py-2 text-sm font-medium sm:px-4 ${glass ? 'text-slate-700 hover:bg-slate-100' : 'text-white/90 hover:bg-white/10'}`}>
              Owner Dashboard
            </a>
          )}
          {!user && (
            <>
              <Link to="/login"
                className={`rounded-lg px-3 py-2 text-sm font-medium sm:px-4 ${glass ? 'text-slate-700 hover:bg-slate-100' : 'text-white/90 hover:bg-white/10'}`}>
                Advertiser login
              </Link>
              <a href={MEDIA_OWNER_LOGIN_URL}
                className={`hidden rounded-lg border px-3 py-2 text-sm font-medium sm:inline-flex ${glass ? 'border-amber-300/80 bg-amber-50 text-amber-900 hover:bg-amber-100' : 'border-amber-300/50 bg-amber-400/20 text-white hover:bg-amber-400/30'}`}>
                Media owner login
              </a>
              {showAdminLink && (
                <a href={ADMIN_LOGIN_URL}
                  className={`hidden items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium lg:inline-flex ${glass ? 'text-slate-600 hover:bg-slate-100' : 'text-white/80 hover:bg-white/10'}`}>
                  <Shield className="h-3.5 w-3.5" /> Admin
                </a>
              )}
              <Link to="/signup"
                className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-orange-600 sm:px-4">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
