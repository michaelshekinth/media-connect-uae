import { useCallback, useEffect, useState } from 'react'
import {
  adminApproveListing, adminApproveProfile, adminRejectListing, adminRejectProfile,
  getAllPendingListings, getPendingOwnerProfiles, getMediaOwnerDetail,
} from '../services/adminService'
import { useAdminAuth } from '../context/AdminAuthContext'
import { DataTable, EmptyState, PageHeader, RejectModal, StatusBadge } from '../components/ui'

export function ApprovalsPage() {
  const { session } = useAdminAuth()
  const [tab, setTab] = useState<'profiles' | 'listings'>('profiles')
  const [profiles, setProfiles] = useState<Awaited<ReturnType<typeof getPendingOwnerProfiles>>>([])
  const [listings, setListings] = useState<Awaited<ReturnType<typeof getAllPendingListings>>>([])
  const [rejectTarget, setRejectTarget] = useState<{ type: 'profile' | 'listing'; agencyId: string; listingId?: string } | null>(null)

  const refresh = useCallback(() => {
    getPendingOwnerProfiles().then(setProfiles)
    getAllPendingListings().then(setListings)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const handleApproveProfile = async (agencyId: string) => {
    await adminApproveProfile(agencyId, session!.email)
    refresh()
  }

  const handleRejectProfile = async (reason: string) => {
    if (!rejectTarget || rejectTarget.type !== 'profile') return
    await adminRejectProfile(rejectTarget.agencyId, reason, session!.email)
    setRejectTarget(null)
    refresh()
  }

  const handleApproveListing = async (agencyId: string, listingId: string) => {
    await adminApproveListing(agencyId, listingId, session!.email)
    refresh()
  }

  const handleRejectListing = async (reason: string) => {
    if (!rejectTarget || rejectTarget.type !== 'listing' || !rejectTarget.listingId) return
    await adminRejectListing(rejectTarget.agencyId, rejectTarget.listingId, reason, session!.email)
    setRejectTarget(null)
    refresh()
  }

  return (
    <div>
      <PageHeader title="Pending Approvals" subtitle="Review media owner profiles and listings" />
      <div className="mb-4 flex gap-2">
        <button type="button" onClick={() => setTab('profiles')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === 'profiles' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>
          Profiles ({profiles.length})
        </button>
        <button type="button" onClick={() => setTab('listings')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === 'listings' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>
          Listings ({listings.length})
        </button>
      </div>

      {tab === 'profiles' && (
        profiles.length === 0 ? <EmptyState message="No profiles pending approval" /> : (
          <div className="space-y-4">
            {profiles.map((p) => (
              <ProfileApprovalCard key={p.agencyId} agencyId={p.agencyId} companyName={p.companyName}
                onApprove={() => handleApproveProfile(p.agencyId)}
                onReject={() => setRejectTarget({ type: 'profile', agencyId: p.agencyId })} />
            ))}
          </div>
        )
      )}

      {tab === 'listings' && (
        <DataTable
          headers={['Title', 'Owner', 'Category', 'City', 'Status', 'Actions']}
          rows={listings.map(({ listing, agencyId, companyName }) => [
            listing.title,
            companyName,
            listing.mediaCategory,
            listing.city,
            <StatusBadge key="s" status={listing.status} />,
            <div key="a" className="flex gap-2">
              <button type="button" onClick={() => handleApproveListing(agencyId, listing.id)}
                className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">Approve</button>
              <button type="button" onClick={() => setRejectTarget({ type: 'listing', agencyId, listingId: listing.id })}
                className="rounded bg-red-600/80 px-2 py-1 text-xs font-semibold text-white">Reject</button>
            </div>,
          ])}
        />
      )}

      <RejectModal open={!!rejectTarget} onClose={() => setRejectTarget(null)}
        title={rejectTarget?.type === 'profile' ? 'Reject profile' : 'Reject listing'}
        onConfirm={rejectTarget?.type === 'profile' ? handleRejectProfile : handleRejectListing} />
    </div>
  )
}

function ProfileApprovalCard({ agencyId, companyName, onApprove, onReject }: {
  agencyId: string; companyName: string; onApprove: () => void; onReject: () => void
}) {
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof getMediaOwnerDetail>> | null>(null)
  useEffect(() => { getMediaOwnerDetail(agencyId).then(setDetail) }, [agencyId])
  const p = detail?.data.companyProfile

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white">{companyName || p?.companyLegalName}</h3>
          <p className="mt-1 text-sm text-slate-400">{p?.authorizedPerson} · {p?.phone}</p>
          <p className="text-sm text-slate-400">License: {p?.licenseNumber} · Expires {p?.licenseExpiry}</p>
          <p className="text-sm text-slate-400">Categories: {p?.mediaCategories?.join(', ')}</p>
          <p className="text-sm text-slate-500">Documents: {p?.documents?.map((d) => d.label).join(', ') || 'None'}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onApprove} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Approve</button>
          <button type="button" onClick={onReject} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">Reject</button>
        </div>
      </div>
    </div>
  )
}
