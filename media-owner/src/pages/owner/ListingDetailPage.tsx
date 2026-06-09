import { Pencil, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ListingStatusTimeline } from '../../components/owner/ListingStatusTimeline'
import { useOwnerAuth } from '../../context/OwnerAuthContext'
import { deleteOwnerListing, getOwnerListing } from '../../services/ownerStore'
import type { OwnerListing } from '@shared/types/owner'
import { NotFoundPage } from '../NotFoundPage'

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useOwnerAuth()
  const navigate = useNavigate()
  const [listing, setListing] = useState<OwnerListing | undefined>()
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user?.agencyId || !id) {
      setLoading(false)
      return
    }
    getOwnerListing(user.agencyId, id)
      .then(setListing)
      .finally(() => setLoading(false))
  }, [user?.agencyId, id])

  const handleDelete = async () => {
    if (!user?.agencyId || !listing) return
    const confirmed = window.confirm(
      `Delete "${listing.title}"? This cannot be undone and will remove it from the marketplace.`,
    )
    if (!confirmed) return
    setDeleting(true)
    try {
      await deleteOwnerListing(user.agencyId, listing.id)
      navigate('/dashboard/listings')
    } catch {
      window.alert('Could not delete listing. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-slate-500">Loading listing…</div>
  }

  if (!listing) return <NotFoundPage />

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{listing.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {listing.mediaCategory} · {listing.subcategory} · {listing.city}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/listings/${listing.id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      {listing.imageUrl && (
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="mt-6 aspect-[16/10] w-full rounded-2xl border border-slate-200 object-cover"
        />
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 text-sm">
          <p>
            <strong>Price:</strong> {listing.priceMin.toLocaleString()} AED{' '}
            {listing.pricingType === 'range' && `– ${listing.priceMax.toLocaleString()}`}
          </p>
          <p>
            <strong>Area:</strong> {listing.area || '—'}
          </p>
          {listing.landmark && (
            <p>
              <strong>Landmark:</strong> {listing.landmark}
            </p>
          )}
          {(listing.sizeWidth || listing.sizeHeight) && (
            <p>
              <strong>Size:</strong> {listing.sizeWidth} × {listing.sizeHeight} {listing.sizeUnit}
            </p>
          )}
          <p>
            <strong>Status:</strong>{' '}
            <span className="capitalize">{listing.status.replace('_', ' ')}</span>
          </p>
          {listing.descriptionLong && <p className="pt-2 text-slate-600">{listing.descriptionLong}</p>}
          {listing.deliverables.length > 0 && (
            <ul className="list-disc pl-5 text-slate-600">
              {listing.deliverables.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
          {(listing.documents ?? []).length > 0 && (
            <div className="pt-3">
              <p className="font-medium text-slate-800">Uploaded documents</p>
              <ul className="mt-2 space-y-1 text-slate-600">
                {(listing.documents ?? []).map((d) => (
                  <li key={d.id} className="text-sm">
                    {d.label}: {d.fileName}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <ListingStatusTimeline listing={listing} />
      </div>
    </div>
  )
}
