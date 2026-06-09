import { AnimatePresence, motion } from 'framer-motion'
import { Building2, X } from 'lucide-react'
import { useState } from 'react'
import { useOwnerAuth } from '../../context/OwnerAuthContext'

export function OwnerSignupModal() {
  const { ownerAuthMode, closeOwnerAuth, openOwnerAuth, login, signup } = useOwnerAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [error, setError] = useState('')

  if (!ownerAuthMode) return null

  const isSignup = ownerAuthMode === 'signup'

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
        onClick={closeOwnerAuth}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-slate-800" />
              <h2 className="text-xl font-bold text-slate-900">
                {isSignup ? 'Media Owner Sign up' : 'Media Owner Login'}
              </h2>
            </div>
            <button type="button" onClick={closeOwnerAuth} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="mb-4 text-sm text-slate-500">
            {isSignup
              ? 'Register your media company. You will complete your company profile and license details next.'
              : 'Sign in with your media owner account to manage listings and quotes.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Business email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mediacompany.ae"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
            </div>
            {isSignup && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
              </div>
            )}
            {isSignup && (
              <label className="flex items-start gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5" />
                I agree to MediaConnect UAE terms for media owners
              </label>
            )}
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            <button type="submit" className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800">
              {isSignup ? 'Continue to company profile' : 'Log in'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            {isSignup ? 'Already registered?' : 'New media owner?'}{' '}
            <button type="button" onClick={() => { setError(''); openOwnerAuth(isSignup ? 'login' : 'signup') }}
              className="font-semibold text-slate-800 hover:text-slate-600">
              {isSignup ? 'Log in' : 'Sign up'}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
