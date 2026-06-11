import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createPublisher, getAllMediaOwners } from '../services/adminService'
import { DataTable, PageHeader, StatusBadge } from '../components/ui'

export function MediaOwnersPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [owners, setOwners] = useState<Awaited<ReturnType<typeof getAllMediaOwners>>>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [skipOnboarding, setSkipOnboarding] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const refresh = () => {
    const status = filter === 'all' ? undefined : filter
    getAllMediaOwners(status).then(setOwners)
  }

  useEffect(() => { refresh() }, [filter])

  const handleCreate = async () => {
    if (!email.trim() || !password.trim() || !companyName.trim()) {
      setError('Email, password, and company name are required')
      return
    }
    setCreating(true)
    setError('')
    try {
      await createPublisher({ email: email.trim(), password, companyName: companyName.trim(), skipOnboarding })
      setModalOpen(false)
      setEmail('')
      setPassword('')
      setCompanyName('')
      setSkipOnboarding(false)
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create publisher')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <PageHeader title="Publishers" subtitle="Pending, approved, and rejected partners"
        action={
          <button type="button" onClick={() => setModalOpen(true)}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900">
            Create Publisher
          </button>
        } />
      <div className="mb-4 flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm capitalize ${filter === f ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>{f}</button>
        ))}
      </div>
      <DataTable
        headers={['Company', 'Contact', 'Status', 'Listings', 'Live', 'Actions']}
        rows={owners.map((o) => [
          o.companyName || o.companyProfile?.companyLegalName || '—',
          o.email,
          <StatusBadge key="s" status={o.ownerApprovalStatus ?? 'draft'} />,
          o.listingsCount,
          o.liveListings,
          <Link key="v" to={`/media-owners/${o.agencyId}`} className="text-amber-400 hover:underline">View</Link>,
        ])}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-600 bg-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white">Create Publisher</h3>
            <label className="mt-4 block text-sm text-slate-400">Company name</label>
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white" />
            <label className="mt-3 block text-sm text-slate-400">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white" />
            <label className="mt-3 block text-sm text-slate-400">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password"
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white" />
            <label className="mt-3 flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={skipOnboarding} onChange={(e) => setSkipOnboarding(e.target.checked)} />
              Skip onboarding (auto-approve)
            </label>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300">Cancel</button>
              <button type="button" onClick={handleCreate} disabled={creating}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50">
                {creating ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
