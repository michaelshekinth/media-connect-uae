import { useEffect, useState } from 'react'
import { getAllListings } from '../services/adminService'
import { DataTable, PageHeader, StatusBadge } from '../components/ui'

export function ListingsPage() {
  const [status, setStatus] = useState<string>('')
  const [listings, setListings] = useState<Awaited<ReturnType<typeof getAllListings>>>([])

  useEffect(() => {
    getAllListings(status ? { status } : undefined).then(setListings)
  }, [status])

  return (
    <div>
      <PageHeader title="Listings" subtitle="All media owner listings across the platform" />
      <div className="mb-4 flex flex-wrap gap-2">
        {['', 'pending_approval', 'approved', 'rejected', 'draft'].map((s) => (
          <button key={s || 'all'} type="button" onClick={() => setStatus(s)}
            className={`rounded-lg px-3 py-1.5 text-sm ${status === s ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>
            {s ? s.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>
      <DataTable
        headers={['Title', 'Owner', 'Category', 'City', 'Price', 'Status']}
        rows={listings.map(({ listing, companyName }) => [
          listing.title,
          companyName,
          listing.mediaCategory,
          listing.city,
          `${listing.priceMin.toLocaleString()} AED`,
          <StatusBadge key="s" status={listing.status} />,
        ])}
      />
    </div>
  )
}
