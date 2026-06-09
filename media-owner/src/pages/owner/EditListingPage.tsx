import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ApprovalGate } from '../../components/owner/ApprovalGate'
import { CreateListingForm } from '../../components/owner/CreateListingForm'
import { useOwnerAuth } from '../../context/OwnerAuthContext'
import { getOwnerListing, submitListingForApproval, updateOwnerListing } from '../../services/ownerStore'
import type { OwnerListing } from '@shared/types/owner'
import { NotFoundPage } from '../NotFoundPage'

export function EditListingPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useOwnerAuth()
  const navigate = useNavigate()
  const [listing, setListing] = useState<OwnerListing | undefined>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.agencyId || !id) {
      setLoading(false)
      return
    }
    getOwnerListing(user.agencyId, id)
      .then(setListing)
      .finally(() => setLoading(false))
  }, [user?.agencyId, id])

  if (!user?.agencyId) return null
  if (loading) return <div className="py-12 text-center text-slate-500">Loading listing…</div>
  if (!listing) return <NotFoundPage />

  const handleSubmit = async (updated: OwnerListing) => {
    setSaving(true)
    setError('')
    try {
      await updateOwnerListing(user.agencyId!, { ...updated, id: listing.id })
      if (listing.status === 'rejected') {
        await submitListingForApproval(user.agencyId!, listing.id)
      }
      navigate(`/listings/${listing.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save listing')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        to={`/listings/${listing.id}`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listing
      </Link>

      <ApprovalGate message="You need admin approval before editing listings.">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {listing.status === 'approved' && (
            <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Saving changes to a live listing will send it back for admin approval before it appears on the marketplace again.
            </p>
          )}
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <CreateListingForm
            agencyId={user.agencyId}
            mode="edit"
            initialListing={listing}
            submitting={saving}
            onSubmit={handleSubmit}
          />
        </div>
      </ApprovalGate>
    </div>
  )
}
