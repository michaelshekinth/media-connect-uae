import { Shield } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

export function AdminLoginPage() {
  const { session, login } = useAdminAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@mediaconnect.ae')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (session) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = await login(email, password)
    if (err) setError(err)
    else navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
      <p className="mb-6 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
        Super Admin Portal · Port 5174
      </p>
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <Shield className="h-8 w-8 text-amber-400" />
          <div>
            <h1 className="text-xl font-bold text-white">Super Admin</h1>
            <p className="text-xs text-slate-400">Platform control — not advertiser or publisher login</p>
          </div>
        </div>
        <label className="block text-sm text-slate-400">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
          className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-white" />
        <label className="mt-4 block text-sm text-slate-400">Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required
          className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-white" />
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <button type="submit" className="mt-6 w-full rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-400">
          Sign in
        </button>
        <p className="mt-4 text-center text-xs text-slate-500">
          Use the super admin account created by <code className="text-slate-400">npm run seed</code>.
        </p>
      </form>
      <p className="mt-6 max-w-sm text-center text-xs text-slate-500">
        Advertisers use <span className="text-slate-400">localhost:5173/login</span> · Media owners use{' '}
        <span className="text-slate-400">localhost:5173/owner/login</span>
      </p>
    </div>
  )
}
