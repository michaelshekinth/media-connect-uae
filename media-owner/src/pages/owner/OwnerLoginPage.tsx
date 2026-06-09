import { Building2 } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import {
  ADMIN_LOGIN_URL,
  ADVERTISER_LOGIN_URL,
} from '@shared/constants/portals'
import { useOwnerAuth } from '../../context/OwnerAuthContext'

export function OwnerLoginPage() {
  const { user, login, signup } = useOwnerAuth()
  const { pathname } = useLocation()
  const isSignup = pathname === '/signup'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [error, setError] = useState('')

  if (user?.role === 'media_owner') {
    return <Navigate to={user.ownerProfileComplete ? '/dashboard' : '/onboarding'} replace />
  }
  if (user?.role === 'advertiser') {
    window.location.href = ADVERTISER_LOGIN_URL
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please fill in all fields')
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
    if (isSignup && !terms) {
      setError('Please accept the terms to continue')
      return
    }
    const err = await (isSignup ? signup(email, password) : login(email, password))
    if (err) setError(err)
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 shadow-lg">
            <Building2 className="h-7 w-7 text-slate-900" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isSignup ? 'Register as media owner' : 'Media owner login'}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage listings, respond to RFQs, and connect with advertisers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Business email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@company.ae" required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100" />
            </div>
            {isSignup && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100" />
                </div>
                <label className="flex items-start gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1" />
                  I agree to the platform terms and listing policies
                </label>
              </>
            )}
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            <button type="submit" className="w-full rounded-xl bg-amber-400 py-3 text-sm font-bold text-slate-900 hover:bg-amber-500">
              {isSignup ? 'Create owner account' : 'Log in'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          {isSignup ? 'Already registered?' : 'New media owner?'}{' '}
          <Link to={isSignup ? '/login' : '/signup'} className="font-semibold text-amber-700 hover:text-amber-900">
            {isSignup ? 'Log in' : 'Sign up'}
          </Link>
        </p>

        <div className="mt-8 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Other portals</p>
          <p>
            Advertiser?{' '}
            <a href={ADVERTISER_LOGIN_URL} className="font-medium text-indigo-600 hover:underline">Advertiser login</a>
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
