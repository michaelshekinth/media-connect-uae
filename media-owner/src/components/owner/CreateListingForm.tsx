import { ArrowLeft, ArrowRight, Pencil, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DocumentUpload, MultiDocumentUpload } from '../ui/DocumentUpload'
import { ListingMapPicker } from './ListingMapPicker'
import { CITY_CONFIGS, MEDIA_CATEGORIES, MEDIA_CATEGORY_LABELS, UAE_CITIES } from '@shared/constants'
import type {
  AssetOwnership,
  BillingDuration,
  OwnerListing,
  OwnerMediaCategory,
  PricingType,
  UploadedDocument,
} from '@shared/types/owner'
import type { Subcategory } from '@shared/types/categories'
import type { City } from '@shared/types'
import { documentsFromListing, galleryFromDocuments, heroImageFromDocuments } from '../../utils/ownerDocuments'
import { findDocument } from '@shared/utils/fileUpload'
import { fetchPublicSubcategories, requestSubcategory } from '../../services/ownerStore'

const OBJECTIVE_OPTIONS = [
  'Brand awareness',
  'Product launch',
  'Lead generation',
  'Event promotion',
  'Seasonal campaign',
  'Foot traffic',
]

const OOH_TYPE_OPTIONS = ['Static billboard', 'Digital / DOOH', 'Transit', 'Mall', 'Street furniture', 'Airport']

interface CreateListingFormProps {
  agencyId: string
  mode?: 'create' | 'edit'
  initialListing?: OwnerListing
  submitting?: boolean
  onSubmit: (listing: OwnerListing) => void
}

export function CreateListingForm({
  agencyId,
  mode = 'create',
  initialListing,
  submitting = false,
  onSubmit,
}: CreateListingFormProps) {
  const isEdit = mode === 'edit'
  const [step, setStep] = useState<1 | 2>(1)
  const [category, setCategory] = useState<OwnerMediaCategory>('OOH')
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [subcategoryId, setSubcategoryId] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [title, setTitle] = useState('')
  const [emirate, setEmirate] = useState<City>('Dubai')
  const [city, setCity] = useState<City>('Dubai')
  const [area, setArea] = useState('')
  const [landmark, setLandmark] = useState('')
  const [lat, setLat] = useState(CITY_CONFIGS.Dubai.lat)
  const [lng, setLng] = useState(CITY_CONFIGS.Dubai.lng)
  const [sizeWidth, setSizeWidth] = useState('')
  const [sizeHeight, setSizeHeight] = useState('')
  const [sizeUnit, setSizeUnit] = useState('m')
  const [availability, setAvailability] = useState<'immediate' | '1-2-weeks'>('immediate')
  const [pricingType, setPricingType] = useState<PricingType>('fixed')
  const [price, setPrice] = useState('50000')
  const [priceMax, setPriceMax] = useState('')
  const [billingDuration, setBillingDuration] = useState<BillingDuration>('per_month')
  const [customDurationLabel, setCustomDurationLabel] = useState('')
  const [oohType, setOohType] = useState('')
  const [mediaTypeDetail, setMediaTypeDetail] = useState('')
  const [objectives, setObjectives] = useState<string[]>([])
  const [assetOwnership, setAssetOwnership] = useState<AssetOwnership>('owned')
  const [aboutPlacement, setAboutPlacement] = useState('')
  const [deliverables, setDeliverables] = useState('Artwork display\nPrinting & installation\nWeekly proof photos')
  const [description, setDescription] = useState('')
  const [isDirectMedia, setIsDirectMedia] = useState(true)
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [error, setError] = useState('')
  const [hydrated, setHydrated] = useState(!initialListing)
  const [loadingSubs, setLoadingSubs] = useState(false)
  const [showSubRequest, setShowSubRequest] = useState(false)
  const [proposedSub, setProposedSub] = useState('')
  const [subRequestStatus, setSubRequestStatus] = useState('')

  useEffect(() => {
    if (!initialListing) return
    setCategory(initialListing.mediaCategory)
    setSubcategoryId(initialListing.subcategoryId ?? '')
    setSubcategory(initialListing.subcategory)
    setTitle(initialListing.title)
    setEmirate((initialListing.emirate || initialListing.city) as City)
    setCity(initialListing.city as City)
    setArea(initialListing.area)
    setLandmark(initialListing.landmark)
    setLat(initialListing.lat)
    setLng(initialListing.lng)
    setSizeWidth(initialListing.sizeWidth)
    setSizeHeight(initialListing.sizeHeight)
    setSizeUnit(initialListing.sizeUnit)
    setAvailability(initialListing.availability)
    setPricingType(initialListing.pricingType)
    setPrice(String(initialListing.priceMin))
    setPriceMax(initialListing.priceMax > initialListing.priceMin ? String(initialListing.priceMax) : '')
    setBillingDuration(initialListing.billingDuration)
    setCustomDurationLabel(initialListing.customDurationLabel ?? '')
    setOohType(initialListing.oohType ?? '')
    setMediaTypeDetail(initialListing.mediaTypeDetail ?? '')
    setObjectives(initialListing.objectives ?? [])
    setAssetOwnership(initialListing.assetOwnership ?? 'owned')
    setAboutPlacement(initialListing.aboutPlacement || initialListing.descriptionLong || '')
    setDeliverables(initialListing.deliverables.join('\n'))
    setDescription(initialListing.descriptionLong || initialListing.descriptionShort)
    setIsDirectMedia(initialListing.isDirectMedia)
    setDocuments(documentsFromListing(initialListing))
    setHydrated(true)
  }, [initialListing])

  useEffect(() => {
    setLoadingSubs(true)
    fetchPublicSubcategories(category)
      .then((subs) => {
        setSubcategories(subs)
        const byId = subs.find((s) => s.id === subcategoryId)
        const byName = subs.find((s) => s.name === subcategory)
        if (byId) {
          setSubcategory(byId.name)
        } else if (byName) {
          setSubcategoryId(byName.id)
        } else {
          const first = subs[0]
          if (first) {
            setSubcategoryId(first.id)
            setSubcategory(first.name)
          }
        }
      })
      .catch(() => setSubcategories([]))
      .finally(() => setLoadingSubs(false))
  }, [category])

  const setHeroDoc = (doc: UploadedDocument | null) => {
    setDocuments((prev) => {
      const rest = prev.filter((d) => d.type !== 'hero_image')
      return doc ? [...rest, { ...doc, type: 'hero_image', label: 'Hero image' }] : rest
    })
  }

  const setGalleryDocs = (gallery: UploadedDocument[]) => {
    setDocuments((prev) => [
      ...prev.filter((d) => d.type !== 'gallery_image'),
      ...gallery,
    ])
  }

  const setSupportDocs = (support: UploadedDocument[]) => {
    setDocuments((prev) => [
      ...prev.filter((d) => !['media_kit', 'rate_card', 'site_map', 'other'].includes(d.type)),
      ...support,
    ])
  }

  const handleEmirateChange = (next: City) => {
    setEmirate(next)
    setCity(next)
    if (next === 'All UAE') return
    const config = CITY_CONFIGS[next]
    setLat(config.lat)
    setLng(config.lng)
  }

  const toggleObjective = (obj: string) => {
    setObjectives((prev) =>
      prev.includes(obj) ? prev.filter((o) => o !== obj) : [...prev, obj],
    )
  }

  const handleSubcategoryChange = (id: string) => {
    setSubcategoryId(id)
    const match = subcategories.find((s) => s.id === id)
    if (match) setSubcategory(match.name)
  }

  const submitSubcategoryRequest = async () => {
    if (!proposedSub.trim()) {
      setSubRequestStatus('Enter a proposed subcategory name')
      return
    }
    try {
      await requestSubcategory(category, proposedSub.trim())
      setSubRequestStatus('Request submitted — our team will review it.')
      setProposedSub('')
      setTimeout(() => setShowSubRequest(false), 1500)
    } catch (e) {
      setSubRequestStatus(e instanceof Error ? e.message : 'Request failed')
    }
  }

  const goToStep2 = () => {
    if (!title.trim()) {
      setError('Listing title is required')
      return
    }
    if (!subcategory) {
      setError('Select a subcategory')
      return
    }
    setError('')
    setStep(2)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!aboutPlacement.trim()) {
      setError('About this placement is required for advertisers to review your inventory')
      return
    }
    const priceMin = pricingType === 'on_request' ? 0 : Number(price) || 0
    const priceMaxVal =
      pricingType === 'range' ? Number(priceMax) || priceMin : priceMin
    const fallbackImage = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop'

    const listing: OwnerListing = {
      id: initialListing?.id ?? `ol_${Date.now()}`,
      agencyId,
      title: title.trim(),
      mediaCategory: category,
      mediaType: category,
      subcategory,
      subcategoryId: subcategoryId || undefined,
      emirate,
      city,
      area,
      landmark,
      sizeWidth,
      sizeHeight,
      sizeUnit,
      pricingType,
      priceMin,
      priceMax: priceMaxVal,
      billingDuration,
      customDurationLabel: billingDuration === 'custom' ? customDurationLabel : undefined,
      oohType: category === 'OOH' ? oohType : undefined,
      mediaTypeDetail: mediaTypeDetail || undefined,
      objectives,
      assetOwnership,
      aboutPlacement: aboutPlacement.trim(),
      availability,
      descriptionShort: (description || aboutPlacement).slice(0, 160),
      descriptionLong: description || aboutPlacement,
      imageUrl: heroImageFromDocuments(documents, fallbackImage),
      galleryImages: galleryFromDocuments(documents),
      deliverables: deliverables.split('\n').filter(Boolean),
      isDirectMedia,
      lat,
      lng,
      status: initialListing?.status ?? 'pending_approval',
      submittedAt: isEdit ? initialListing?.submittedAt : new Date().toISOString(),
      createdAt: initialListing?.createdAt ?? new Date().toISOString(),
      documents,
    }
    onSubmit(listing)
  }

  if (!hydrated) {
    return <div className="py-8 text-center text-sm text-slate-500">Loading form…</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {isEdit ? (
            <Pencil className="h-5 w-5 text-orange-500" />
          ) : (
            <Plus className="h-5 w-5 text-orange-500" />
          )}
          <h2 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Listing' : 'Create Listing'}</h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className={step === 1 ? 'text-slate-900' : ''}>1. Basics</span>
          <span>→</span>
          <span className={step === 2 ? 'text-slate-900' : ''}>2. Details</span>
        </div>
      </div>

      {step === 1 ? (
        <>
          <p className="text-sm text-slate-500">Set category, title, and pricing. You&apos;ll add placement details next.</p>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Media Category</label>
            <div className="flex flex-wrap gap-2">
              {MEDIA_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${category === c ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-700'}`}
                >
                  {MEDIA_CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-slate-600">Subcategory</label>
              <button
                type="button"
                onClick={() => { setShowSubRequest(true); setSubRequestStatus('') }}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700"
              >
                Request new subcategory
              </button>
            </div>
            <select
              value={subcategoryId}
              onChange={(e) => handleSubcategoryChange(e.target.value)}
              disabled={loadingSubs}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            >
              {subcategories.length === 0 && <option value="">No subcategories available</option>}
              {subcategories.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Listing Title *</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sheikh Zayed Road Digital Billboard"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Emirate</label>
              <select
                value={emirate}
                onChange={(e) => handleEmirateChange(e.target.value as City)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              >
                {UAE_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">City / area label</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value as City)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              >
                {UAE_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Pricing Type</label>
            <select
              value={pricingType}
              onChange={(e) => setPricingType(e.target.value as PricingType)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            >
              <option value="fixed">Fixed price</option>
              <option value="starting_price">Starting price</option>
              <option value="range">Price range</option>
              <option value="on_request">On request</option>
            </select>
          </div>

          {pricingType !== 'on_request' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  {pricingType === 'starting_price' ? 'Starting price (AED)' : 'Price (AED)'}
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>
              {pricingType === 'range' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-600">Max price (AED)</label>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                  />
                </div>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Billing Duration</label>
              <select
                value={billingDuration}
                onChange={(e) => setBillingDuration(e.target.value as BillingDuration)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              >
                <option value="per_day">Per day</option>
                <option value="per_week">Per week</option>
                <option value="per_month">Per month</option>
                <option value="per_campaign">Per campaign</option>
                <option value="per_spot">Per spot</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {billingDuration === 'custom' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Custom duration label</label>
                <input
                  value={customDurationLabel}
                  onChange={(e) => setCustomDurationLabel(e.target.value)}
                  placeholder="e.g. Per 30-second spot"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="button"
            onClick={goToStep2}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Next: Add details <ArrowRight className="h-4 w-4" />
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-slate-500">Describe the placement — advertisers see this on the listing page after approval.</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Area / District *</label>
              <input
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Financial Centre"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Nearby Landmark</label>
              <input
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near DIFC Gate"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Map location</label>
            <ListingMapPicker emirate={emirate} lat={lat} lng={lng} onChange={(a, b) => { setLat(a); setLng(b) }} />
          </div>

          {category === 'OOH' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">OOH type</label>
              <select
                value={oohType}
                onChange={(e) => setOohType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              >
                <option value="">Select type</option>
                {OOH_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Media type detail</label>
            <input
              value={mediaTypeDetail}
              onChange={(e) => setMediaTypeDetail(e.target.value)}
              placeholder={
                category === 'ContentCreators'
                  ? 'e.g. Lifestyle creator, 250K followers'
                  : 'e.g. Prime time slot, 30s spot'
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Campaign objectives</label>
            <div className="flex flex-wrap gap-2">
              {OBJECTIVE_OPTIONS.map((obj) => (
                <button
                  key={obj}
                  type="button"
                  onClick={() => toggleObjective(obj)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium ${objectives.includes(obj) ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600'}`}
                >
                  {obj}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Asset ownership</label>
            <div className="flex gap-2">
              {(['owned', 'leased'] as AssetOwnership[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAssetOwnership(v)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${assetOwnership === v ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-700'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Width</label>
              <input
                value={sizeWidth}
                onChange={(e) => setSizeWidth(e.target.value)}
                placeholder="14"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Height</label>
              <input
                value={sizeHeight}
                onChange={(e) => setSizeHeight(e.target.value)}
                placeholder="48"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Unit</label>
              <select
                value={sizeUnit}
                onChange={(e) => setSizeUnit(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              >
                <option value="m">Metres (m)</option>
                <option value="ft">Feet (ft)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Availability</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as typeof availability)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            >
              <option value="immediate">Immediate</option>
              <option value="1-2-weeks">1–2 weeks</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">About this placement *</label>
            <textarea
              required
              value={aboutPlacement}
              onChange={(e) => setAboutPlacement(e.target.value)}
              rows={4}
              placeholder="Describe visibility, audience reach, traffic data, and creative specs…"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Full Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Optional extended description for the listing page…"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Deliverables (one per line)</label>
            <textarea
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />
          </div>

          <DocumentUpload
            label="Hero image"
            hint="Main photo shown on the listing card"
            accept="image/*"
            documentType="hero_image"
            value={findDocument(documents, 'hero_image') ?? null}
            onChange={setHeroDoc}
          />

          <MultiDocumentUpload
            label="Gallery images"
            hint="Additional placement photos (up to 4)"
            accept="image/*"
            documentType="gallery_image"
            values={documents.filter((d) => d.type === 'gallery_image')}
            onChange={setGalleryDocs}
            maxFiles={4}
          />

          <MultiDocumentUpload
            label="Supporting documents"
            hint="Media kit, rate card, site map, or spec sheet (PDF)"
            accept=".pdf,image/*"
            documentType="media_kit"
            values={documents.filter((d) => ['media_kit', 'rate_card', 'site_map', 'other'].includes(d.type))}
            onChange={setSupportDocs}
            maxFiles={5}
          />

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isDirectMedia} onChange={(e) => setIsDirectMedia(e.target.checked)} />
            Direct media (book without agency markup)
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setStep(1); setError('') }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-[2] rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Submit for approval'}
            </button>
          </div>
        </>
      )}

      {showSubRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Request subcategory</h3>
              <button type="button" onClick={() => setShowSubRequest(false)} className="text-slate-500 hover:text-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Propose a new subcategory for {MEDIA_CATEGORY_LABELS[category]}. An admin will review your request.
            </p>
            <input
              value={proposedSub}
              onChange={(e) => setProposedSub(e.target.value)}
              placeholder="e.g. Airport digital screens"
              className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />
            {subRequestStatus && (
              <p className={`mt-2 text-sm ${subRequestStatus.includes('submitted') ? 'text-emerald-600' : 'text-red-600'}`}>
                {subRequestStatus}
              </p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setShowSubRequest(false)} className="rounded-xl border px-4 py-2 text-sm font-medium">
                Cancel
              </button>
              <button type="button" onClick={submitSubcategoryRequest} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                Submit request
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
