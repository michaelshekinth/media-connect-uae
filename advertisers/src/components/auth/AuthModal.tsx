import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getPendingRedirect } from './ProtectedRoute'

export function AuthModal() {
  const { authMode, closeAuth, openAuth, login, signup } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  if (!authMode) return null

  const isSignup = authMode === 'signup'

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

    const err = await (isSignup ? signup(email, password) : login(email, password))
    if (err) {
      setError(err)
      return
    }

    setEmail('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={closeAuth}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h2>
            <button type="button" onClick={closeAuth} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          {getPendingRedirect() && (
            <p className="mb-4 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
              Log in to continue your search and browse media placements.
            </p>
          )}

          <p className="mb-4 text-sm text-slate-500">
            {isSignup
              ? 'Sign up with your email to browse and request media quotes.'
              : 'Sign in with your advertiser account to browse and request media quotes.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none" />
            </div>
            {isSignup && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none" />
              </div>
            )}
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg hover:from-indigo-700 hover:to-violet-700">
              {isSignup ? 'Sign up' : 'Log in'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" onClick={() => { setError(''); openAuth(isSignup ? 'login' : 'signup') }}
              className="font-semibold text-indigo-600 hover:text-indigo-800">
              {isSignup ? 'Log in' : 'Sign up'}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
