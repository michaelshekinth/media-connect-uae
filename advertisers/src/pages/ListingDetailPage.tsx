import {
  ArrowLeft,
  BadgeCheck,
  FileText,
  Heart,
  MapPin,
  Monitor,
  Ruler,
  Shield,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { setPendingRedirectPath } from '../components/auth/ProtectedRoute'
import { useAuth } from '../context/AuthContext'
import { SimilarListings } from '../components/agency/SimilarListings'
import { RequestQuoteModal } from '../components/quotes/RequestQuoteModal'
import { ApiError } from '@shared/services/apiClient'
import { getListingById, getSimilarListings } from '@shared/services/listingCatalog'
import { isFavoriteListing, toggleFavoriteListing } from '../services/userStore'
import type { Listing, ListingDetail } from '@shared/types'
import { NotFoundPage } from './NotFoundPage'

type OutletCtx = { showToast: (msg: string) => void }

const billingLabel: Record<string, string> = {
  per_week: 'week',
  per_month: 'month',
  per_campaign: 'campaign',
  per_spot: 'spot',
}

const availabilityLabel: Record<string, string> = {
  immediate: 'Immediate',
  '1-2-weeks': '1–2 weeks',
}

function formatPrice(listing: ListingDetail) {
  if (listing.pricingType === 'on_request') return 'Price on request'
  const min = listing.budgetMin.toLocaleString()
  const period = billingLabel[listing.billingDuration] ?? 'month'
  if (listing.pricingType === 'range' && listing.budgetMax > listing.budgetMin) {
    return `From AED ${min} – ${listing.budgetMax.toLocaleString()} / ${period}`
  }
  return `From AED ${min} / ${period}`
}

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useOutletContext<OutletCtx>()
  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [saved, setSaved] = useState(false)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [similarListings, setSimilarListings] = useState<Listing[]>([])

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    setLoadError(null)
    setSimilarListings([])
    getListingById(id)
      .then((data) => {
        setListing(data)
        if (data) {
          isFavoriteListing(data.id).then(setSaved).catch(() => setSaved(false))
          getSimilarListings(data).then(setSimilarListings).catch(() => setSimilarListings([]))
        }
      })
      .catch((e) => {
        setListing(null)
        if (e instanceof ApiError) {
          setLoadError(e.message)
        } else {
          setLoadError('Could not reach the server. Run npm run dev:all and try again.')
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-slate-500">Loading placement…</div>
  }

  if (loadError) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <p className="text-lg font-semibold text-slate-900">Unable to load this placement</p>
        <p className="mt-2 text-sm text-slate-500">{loadError}</p>
        <Link to="/browse" className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
          Back to browse
        </Link>
      </div>
    )
  }

  if (!listing) return <NotFoundPage />

  const images = [listing.imageUrl, ...listing.galleryImages.filter((u) => u !== listing.imageUrl)]
  const dimensions =
    listing.sizeWidth && listing.sizeHeight
      ? `${listing.sizeWidth} × ${listing.sizeHeight} ${listing.sizeUnit}`
      : null

  const requireAdvertiser = () => {
    if (user?.role === 'advertiser') return true
    setPendingRedirectPath(`/listing/${listing.id}`)
    navigate('/login')
    return false
  }

  const handleSave = async () => {
    if (!requireAdvertiser()) return
    const next = await toggleFavoriteListing(listing.id)
    setSaved(next)
    showToast(next ? 'Listing saved' : 'Removed from favourites')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/browse"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {listing.mediaCategory || listing.mediaType}
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <img
              src={images[activeImage] || listing.imageUrl}
              alt={listing.title}
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {images.slice(0, 4).map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`overflow-hidden rounded-xl border-2 transition-all ${
                    activeImage === i ? 'border-amber-400' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              <Monitor className="h-3.5 w-3.5" />
              {listing.subcategory || listing.mediaType}
            </span>
            {listing.isDirectMedia && (
              <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-700">Direct Media</span>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{listing.title}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-slate-600">
            <MapPin className="h-4 w-4 text-amber-500" />
            {listing.city}
            {listing.area ? ` · ${listing.area}` : ''}
            {listing.landmark ? ` · ${listing.landmark}` : ''}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {dimensions && (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Size</p>
                <p className="mt-1 flex items-center gap-2 font-semibold text-slate-900">
                  <Ruler className="h-4 w-4 text-slate-500" />
                  {dimensions}
                </p>
              </div>
            )}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Availability</p>
              <p className="mt-1 font-semibold text-slate-900">
                {availabilityLabel[listing.availability] ?? listing.availability}
              </p>
            </div>
            {listing.area && (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Area</p>
                <p className="mt-1 font-semibold text-slate-900">{listing.area}</p>
              </div>
            )}
            {listing.landmark && (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Landmark</p>
                <p className="mt-1 font-semibold text-slate-900">{listing.landmark}</p>
              </div>
            )}
          </div>

          <section className="mt-8">
            <h2 className="text-lg font-bold text-slate-900">About this placement</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              {listing.descriptionLong || listing.descriptionShort}
            </p>
          </section>

          {listing.deliverables.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-slate-900">Deliverables</h2>
              <ul className="mt-3 space-y-2">
                {listing.deliverables.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-slate-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    {d}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Pricing</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{formatPrice(listing)}</p>

            {listing.agency && (
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
                  style={{ backgroundColor: listing.agency.color }}
                >
                  {listing.agency.initials}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <Link to={`/agency/${listing.agency.id}`} className="font-semibold text-slate-900 hover:underline">
                      {listing.agency.name}
                    </Link>
                    {listing.agency.verified && <BadgeCheck className="h-4 w-4 text-indigo-600" />}
                  </div>
                  <p className="text-xs text-slate-500">{listing.mediaCategory || listing.mediaType}</p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (!requireAdvertiser()) return
                setQuoteOpen(true)
              }}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3.5 text-sm font-bold text-slate-900 transition-colors hover:bg-amber-300"
            >
              <FileText className="h-4 w-4" />
              Request Quote
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
            >
              <Heart className={`h-4 w-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
              {saved ? 'Saved' : 'Save Listing'}
            </button>

            <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-slate-400">
              <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
              Direct contact is unavailable before an RFQ. All communication stays securely inside MediaConnect UAE.
            </p>
          </div>
        </aside>
      </div>

      {similarListings.length > 0 && (
        <section className="mt-16 border-t border-slate-200 pt-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Similar placements</h2>
            <p className="mt-2 text-slate-500">
              Other {listing.mediaType} opportunities in {listing.city} and nearby areas
            </p>
          </div>
          <SimilarListings listings={similarListings} />
        </section>
      )}

      {quoteOpen && listing.agency && (
        <RequestQuoteModal
          agencyId={listing.agencyId}
          agencyName={listing.agencyName}
          listing={listing}
          onClose={() => setQuoteOpen(false)}
          onSuccess={(name) => {
            showToast(`Quote sent to ${name}`)
            setQuoteOpen(false)
          }}
        />
      )}
    </div>
  )
}
