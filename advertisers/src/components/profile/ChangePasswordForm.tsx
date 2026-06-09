import { useState } from 'react'

interface ChangePasswordFormProps {
  onSubmit: (current: string, next: string) => string | null | Promise<string | null>
}

export function ChangePasswordForm({ onSubmit }: ChangePasswordFormProps) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    if (next !== confirm) {
      setError('New passwords do not match')
      return
    }
    if (next.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    const err = await onSubmit(current, next)
    if (err) {
      setError(err)
      return
    }
    setCurrent('')
    setNext('')
    setConfirm('')
    setSuccess(true)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Current password</label>
        <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">New password</label>
        <input type="password" value={next} onChange={(e) => setNext(e.target.value)} required
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Confirm new password</label>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-teal-600">Password updated successfully</p>}
      <button type="submit" className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
        Update password
      </button>
    </form>
  )
}
