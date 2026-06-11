import { Megaphone } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { clearPendingRedirect, getPendingRedirect } from '../components/auth/ProtectedRoute'
import { ADMIN_LOGIN_URL, MEDIA_OWNER_LOGIN_URL } from '@shared/constants/portals'
import { useAuth } from '../context/AuthContext'

export function AdvertiserLoginPage() {
  const { user, login, signup } = useAuth()
  const { pathname } = useLocation()
  const isSignup = pathname === '/signup'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  const [industry, setIndustry] = useState('')
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [error, setError] = useState('')

  if (user?.role === 'advertiser') {
    const pending = getPendingRedirect()
    if (pending) clearPendingRedirect()
    return <Navigate to={pending || '/browse'} replace />
  }
  if (user?.role === 'media_owner') {
    window.location.href = MEDIA_OWNER_LOGIN_URL
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (isSignup && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    const err = await (isSignup
      ? signup(email, password, { companyName, phone, industry, marketingConsent })
      : login(email, password))
    if (err) setError(err)
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg">
            <Megaphone className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isSignup ? 'Create advertiser account' : 'Advertiser login'}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Browse media placements and request quotes from verified owners
          </p>
        </div>

        {getPendingRedirect() && (
          <p className="mb-4 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
            Log in to continue where you left off.
          </p>
        )}

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            {isSignup && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Company</label>
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your company name" required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971 50 000 0000" required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Industry</label>
                  <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Retail, F&B, Technology" required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-600">
                    I agree to receive product updates and marketing emails from MediaConnect UAE
                  </span>
                </label>
              </>
            )}
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            <button type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg hover:from-indigo-700 hover:to-violet-700">
              {isSignup ? 'Create account' : 'Log in'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link to={isSignup ? '/login' : '/signup'} className="font-semibold text-indigo-600 hover:text-indigo-800">
            {isSignup ? 'Log in' : 'Sign up'}
          </Link>
        </p>

        <div className="mt-8 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Other portals</p>
          <p>
            Media owner?{' '}
            <a href={MEDIA_OWNER_LOGIN_URL} className="font-medium text-amber-700 hover:underline">Media owner login</a>
          </p>
          <p>
            Platform admin?{' '}
            <a href={ADMIN_LOGIN_URL} className="font-medium text-slate-800 hover:underline">Super admin login</a>
          </p>
        </div>
      </div>
    </div>
  )
}
