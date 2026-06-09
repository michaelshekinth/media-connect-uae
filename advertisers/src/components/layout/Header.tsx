import {
  Bell,
  ChevronDown,
  Crown,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Shield,
  User,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ADMIN_LOGIN_URL, MEDIA_OWNER_LOGIN_URL } from '@shared/constants/portals'
import { useAuth } from '../../context/AuthContext'
import {
  getPendingQuoteCount,
  getSubscription,
  getUnreadChatCount,
  getUnreadNotificationCount,
} from '../../services/userStore'

interface HeaderProps {
  variant?: 'landing' | 'app'
}

const navBtnBase =
  'inline-flex items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap transition-colors min-h-9 px-3'

function navBtnClass(glass: boolean, variant: 'ghost' | 'outline' | 'primary' = 'ghost') {
  if (variant === 'primary') {
    return `${navBtnBase} bg-orange-500 px-3.5 font-semibold text-white shadow-md hover:bg-orange-600 sm:px-4`
  }
  if (variant === 'outline') {
    return glass
      ? `${navBtnBase} border border-amber-300/80 bg-amber-50 text-amber-900 hover:bg-amber-100`
      : `${navBtnBase} border border-amber-300/50 bg-amber-400/20 text-white hover:bg-amber-400/30`
  }
  return glass
    ? `${navBtnBase} text-slate-700 hover:bg-slate-100`
    : `${navBtnBase} text-white/90 hover:bg-white/10`
}

export function Header({ variant = 'landing' }: HeaderProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
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

  useEffect(() => {
    setMobileNavOpen(false)
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileNavOpen])

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

  const guestDesktopLinks = (
    <>
      <Link to="/login" className={navBtnClass(glass)}>
        <span className="hidden sm:inline">Advertiser login</span>
        <span className="sm:hidden">Login</span>
      </Link>
      <a href={MEDIA_OWNER_LOGIN_URL} className={`${navBtnClass(glass, 'outline')} hidden sm:inline-flex`}>
        Media owner
      </a>
      {showAdminLink && (
        <a href={ADMIN_LOGIN_URL} className={`${navBtnClass(glass)} hidden lg:inline-flex gap-1`}>
          <Shield className="h-3.5 w-3.5 shrink-0" /> Admin
        </a>
      )}
      <Link to="/signup" className={navBtnClass(glass, 'primary')}>
        Sign up
      </Link>
    </>
  )

  const guestMobileLinks = (
    <div className="flex flex-col gap-1 p-3">
      <Link to="/login" className={`${navBtnClass(true)} w-full justify-start`} onClick={() => setMobileNavOpen(false)}>
        Advertiser login
      </Link>
      <a
        href={MEDIA_OWNER_LOGIN_URL}
        className={`${navBtnClass(true, 'outline')} w-full justify-start`}
        onClick={() => setMobileNavOpen(false)}
      >
        Media owner login
      </a>
      {showAdminLink && (
        <a
          href={ADMIN_LOGIN_URL}
          className={`${navBtnClass(true)} w-full justify-start gap-2`}
          onClick={() => setMobileNavOpen(false)}
        >
          <Shield className="h-4 w-4 shrink-0" /> Super admin
        </a>
      )}
      <Link
        to="/signup"
        className={`${navBtnClass(true, 'primary')} mt-1 w-full`}
        onClick={() => setMobileNavOpen(false)}
      >
        Sign up
      </Link>
    </div>
  )

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
        glass ? 'header-glass border-b border-white/30 shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 shrink items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-orange-500 shadow-md">
            <Megaphone className="h-5 w-5 text-white" />
          </div>
          <span
            className={`truncate text-base font-bold tracking-tight sm:text-lg ${glass ? 'text-slate-900' : 'text-white'}`}
          >
            MediaConnect UAE
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1.5 md:flex md:gap-2">
          {user && user.role === 'advertiser' && (
            <>
              <Link to="/browse" className={`${navBtnClass(glass)} hidden lg:inline-flex`}>
                Browse
              </Link>
              <Link
                to="/subscription"
                className={`${navBtnClass(glass)} hidden items-center gap-1 text-amber-700 hover:bg-amber-50 sm:inline-flex`}
                title="Subscription"
              >
                <Crown className="h-4 w-4 shrink-0" />
                <span className="max-w-[7rem] truncate">
                  {subscription ? subscription.packageName : 'Subscribe'}
                </span>
              </Link>
              <Link
                to="/dashboard"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
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
                  className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 shadow-sm hover:shadow-md"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                    <p className="border-b border-slate-100 px-4 py-2 text-xs text-slate-500">{user.email}</p>
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        logout()
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {user && user.role === 'media_owner' && (
            <a href={MEDIA_OWNER_LOGIN_URL} className={navBtnClass(glass)}>
              Owner Dashboard
            </a>
          )}
          {!user && guestDesktopLinks}
        </nav>

        {/* Mobile nav controls */}
        <div className="flex items-center gap-1.5 md:hidden">
          {user && user.role === 'advertiser' && (
            <>
              <Link
                to="/dashboard"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <Bell className="h-5 w-5" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                    {notifCount}
                  </span>
                )}
              </Link>
            </>
          )}
          {!user && (
            <Link to="/signup" className={`${navBtnClass(glass, 'primary')} px-3 text-xs sm:text-sm`}>
              Sign up
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${
              glass ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'
            }`}
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileNavOpen && (
        <div className="border-t border-slate-200/80 bg-white/95 backdrop-blur-md md:hidden">
          {user && user.role === 'advertiser' && (
            <div className="flex flex-col gap-1 p-3">
              <p className="px-3 py-1 text-xs text-slate-500">{user.email}</p>
              <Link
                to="/browse"
                className={`${navBtnClass(true)} w-full justify-start`}
                onClick={() => setMobileNavOpen(false)}
              >
                Browse
              </Link>
              <Link
                to="/subscription"
                className={`${navBtnClass(true)} w-full justify-start gap-2 text-amber-700`}
                onClick={() => setMobileNavOpen(false)}
              >
                <Crown className="h-4 w-4" /> Subscription
              </Link>
              <Link
                to="/dashboard"
                className={`${navBtnClass(true)} w-full justify-start`}
                onClick={() => setMobileNavOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className={`${navBtnClass(true)} w-full justify-start`}
                onClick={() => setMobileNavOpen(false)}
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false)
                  logout()
                }}
                className={`${navBtnClass(true)} w-full justify-start text-red-600 hover:bg-red-50`}
              >
                Log out
              </button>
            </div>
          )}
          {user && user.role === 'media_owner' && (
            <div className="p-3">
              <a
                href={MEDIA_OWNER_LOGIN_URL}
                className={`${navBtnClass(true)} w-full`}
                onClick={() => setMobileNavOpen(false)}
              >
                Owner Dashboard
              </a>
            </div>
          )}
          {!user && guestMobileLinks}
        </div>
      )}
    </header>
  )
}
