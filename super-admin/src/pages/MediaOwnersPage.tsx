import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllMediaOwners } from '../services/adminService'
import { DataTable, PageHeader, StatusBadge } from '../components/ui'

export function MediaOwnersPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [owners, setOwners] = useState<Awaited<ReturnType<typeof getAllMediaOwners>>>([])

  useEffect(() => {
    const status = filter === 'all' ? undefined : filter
    getAllMediaOwners(status).then(setOwners)
  }, [filter])

  return (
    <div>
      <PageHeader title="Media Owners" subtitle="Pending, approved, and rejected partners" />
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
    </div>
  )
}
