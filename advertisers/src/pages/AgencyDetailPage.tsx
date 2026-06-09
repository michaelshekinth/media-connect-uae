import { BadgeCheck, Eye, Heart, Lock, Mail, Phone, Share2, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { AgencyGallery } from '../components/agency/AgencyGallery'
import { AgencyMap } from '../components/agency/AgencyMap'
import { Deliverables } from '../components/agency/Deliverables'
import { PricingPlans } from '../components/agency/PricingPlans'
import { SimilarListings } from '../components/agency/SimilarListings'
import { MediaCard } from '../components/browse/MediaCard'
import { RequestQuoteModal } from '../components/quotes/RequestQuoteModal'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { getListingsForAgency } from '@shared/services/listingCatalog'
import { revealContact } from '@shared/services/agencyContact'
import {
  addRecentlyViewed,
  canRevealContact,
  fetchAgency,
  fetchListings,
  hasRevealedContact,
  isFavoriteAgency,
  revealAgencyContact,
  toggleFavoriteAgency,
} from '../services/userStore'
import type { AgencyProfile } from '@shared/types/user'
import type { Listing } from '@shared/types'
import { NotFoundPage } from './NotFoundPage'

type OutletCtx = { showToast: (msg: string) => void }

export function AgencyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { showToast } = useOutletContext<OutletCtx>()
  const [agency, setAgency] = useState<AgencyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [agencyListings, setAgencyListings] = useState<Listing[]>([])
  const [similarListings, setSimilarListings] = useState<Listing[]>([])
  const [saved, setSaved] = useState(false)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [contactRevealed, setContactRevealed] = useState(false)
  const [contact, setContact] = useState<{ email: string; phone: string } | null>(null)
  const [canReveal, setCanReveal] = useState(false)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetchAgency(id)
      .then(async (data) => {
        if (cancelled) return
        setAgency(data as unknown as AgencyProfile)
        const listings = await getListingsForAgency(id, (data as { name?: string }).name)
        if (cancelled) return
        setAgencyListings(listings)
        const all = await fetchListings()
        if (cancelled) return
        const ids = new Set(listings.map((l) => l.id))
        const similar = [...listings, ...all.filter((l) => !ids.has(l.id))]
          .filter((l) => l.agencyId !== id && (l.mediaType === (data as { mediaTypes?: string[] }).mediaTypes?.[0] || l.city === (data as { city?: string }).city))
          .slice(0, 4)
        setSimilarListings(similar)
        addRecentlyViewed(id).catch(() => {})
        const fav = await isFavoriteAgency(id)
        if (!cancelled) setSaved(fav)
        const revealed = await hasRevealedContact(id)
        if (!cancelled) {
          setContactRevealed(revealed)
          if (revealed) {
            const info = await revealContact(id).catch(() => null)
            if (info) setContact(info)
          } else {
            setCanReveal(await canRevealContact(id))
          }
        }
      })
      .catch(() => { if (!cancelled) setAgency(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      showToast('Link copied to clipboard')
    } catch {
      showToast(url)
    }
  }

  const handleToggleSave = async () => {
    if (!agency) return
    const next = await toggleFavoriteAgency(agency.id)
    setSaved(next)
  }

  const handleRevealContact = async () => {
    if (!agency) return
    const ok = await revealAgencyContact(agency.id)
    if (ok) {
      const info = await revealContact(agency.id).catch(() => null)
      if (info) setContact(info)
      setContactRevealed(true)
      showToast('Contact details revealed')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">Loading agency…</div>
    )
  }

  if (!agency) return <NotFoundPage />

  return (
    <div className="pb-24">
      <div className="relative h-48 overflow-hidden sm:h-64">
        <img src={agency.coverImage} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-16 relative mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white text-2xl font-bold text-white shadow-xl sm:h-24 sm:w-24"
              style={{ backgroundColor: agency.color }}>
              {agency.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{agency.name}</h1>
                {agency.verified && <BadgeCheck className="h-6 w-6 text-indigo-600" />}
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{agency.rating}</span>
                <span>({agency.reviewCount} reviews)</span>
                <span>·</span>
                <span>{agency.city}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleToggleSave}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-slate-50">
              <Heart className={`h-4 w-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
              {saved ? 'Saved' : 'Save'}
            </button>
            <button type="button" onClick={handleShare}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-slate-50">
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
        </div>

        <Breadcrumbs items={[{ label: 'Browse', to: '/browse' }, { label: agency.name }]} />

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Contact</h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {contactRevealed && contact ? (
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-slate-700">
                  <Mail className="h-4 w-4 text-indigo-600" />
                  <a href={`mailto:${contact.email}`} className="font-medium text-indigo-600 hover:underline">{contact.email}</a>
                </p>
                <p className="flex items-center gap-2 text-slate-700">
                  <Phone className="h-4 w-4 text-indigo-600" />
                  <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="font-medium text-indigo-600 hover:underline">{contact.phone}</a>
                </p>
              </div>
            ) : canReveal ? (
              <button type="button" onClick={handleRevealContact}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
                <Eye className="h-4 w-4" /> Reveal contact (uses 1 view)
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm">Phone and email hidden</span>
                </div>
                <Link to="/subscription"
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-90">
                  Subscribe to view contact
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-lg font-bold text-slate-900">About</h2>
          <p className="max-w-3xl text-slate-600 leading-relaxed">{agency.about}</p>
          <p className="mt-3 text-sm text-slate-500">
            <strong>HQ:</strong> {agency.address} · <strong>Response time:</strong> within {agency.responseHours}h
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Gallery</h2>
          <AgencyGallery images={agency.gallery} name={agency.name} />
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Services</h2>
          <div className="flex flex-wrap gap-2">
            {agency.services.map((s) => (
              <span key={s} className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-800">
                {s}
              </span>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Pricing plans</h2>
          <PricingPlans plans={agency.pricingPlans} />
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Deliverables</h2>
          <Deliverables items={agency.deliverables} />
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Location</h2>
          <AgencyMap lat={agency.lat} lng={agency.lng} name={agency.name} address={agency.address} />
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Reviews</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {agency.reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{r.author}</span>
                  <div className="flex">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-600">{r.text}</p>
                <p className="mt-2 text-xs text-slate-400">{r.date}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Media placements</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agencyListings.map((listing) => (
              <MediaCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>

        {similarListings.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Similar listings</h2>
            <SimilarListings listings={similarListings} />
          </section>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <p className="hidden text-sm text-slate-600 sm:block">
            Get a tailored quote from {agency.name}
          </p>
          <div className="flex w-full gap-3 sm:w-auto">
            <button type="button" onClick={handleToggleSave}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold sm:flex-none">
              {saved ? 'Saved' : 'Save agency'}
            </button>
            <button type="button" onClick={() => setQuoteOpen(true)}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg sm:flex-none">
              Request quote
            </button>
          </div>
        </div>
      </div>

      {quoteOpen && (
        <RequestQuoteModal
          agencyId={agency.id}
          agencyName={agency.name}
          onClose={() => setQuoteOpen(false)}
          onSuccess={(name) => {
            showToast(`Quote sent to ${name} — expect response within 48h`)
            setQuoteOpen(false)
          }}
        />
      )}
    </div>
  )
}
