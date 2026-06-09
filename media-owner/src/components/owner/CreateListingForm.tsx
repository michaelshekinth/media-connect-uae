import { ArrowLeft, ArrowRight, Pencil, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DocumentUpload, MultiDocumentUpload } from '../ui/DocumentUpload'
import { CITY_CONFIGS, UAE_CITIES } from '@shared/constants'
import type { OwnerListing, OwnerMediaCategory, BillingDuration, PricingType, UploadedDocument } from '@shared/types/owner'
import type { MediaType } from '@shared/types'
import { documentsFromListing, galleryFromDocuments, heroImageFromDocuments } from '../../utils/ownerDocuments'
import { findDocument } from '@shared/utils/fileUpload'

const CATEGORIES: OwnerMediaCategory[] = ['OOH/DOOH', 'TV', 'Radio', 'Print']

const SUBCATEGORIES: Record<OwnerMediaCategory, string[]> = {
  'OOH/DOOH': ['Billboard', 'Digital Screen', 'Bus Shelter', 'Mall', 'Transit'],
  TV: ['Prime Time', 'Daytime', 'Drive Time'],
  Radio: ['Morning Show', 'Drive Time', 'Evening'],
  Print: ['Full Page', 'Half Page', 'Supplement'],
}

function categoryToMediaType(cat: OwnerMediaCategory): MediaType {
  if (cat === 'OOH/DOOH') return 'OOH'
  if (cat === 'TV') return 'TC'
  if (cat === 'Radio') return 'Radio & Print'
  return 'Radio & Print'
}

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
  const [category, setCategory] = useState<OwnerMediaCategory>('OOH/DOOH')
  const [subcategory, setSubcategory] = useState('Billboard')
  const [title, setTitle] = useState('')
  const [city, setCity] = useState<typeof UAE_CITIES[number]>('Dubai')
  const [area, setArea] = useState('')
  const [landmark, setLandmark] = useState('')
  const [sizeWidth, setSizeWidth] = useState('')
  const [sizeHeight, setSizeHeight] = useState('')
  const [sizeUnit, setSizeUnit] = useState('m')
  const [availability, setAvailability] = useState<'immediate' | '1-2-weeks'>('immediate')
  const [pricingType, setPricingType] = useState<PricingType>('fixed')
  const [price, setPrice] = useState('50000')
  const [priceMax, setPriceMax] = useState('')
  const [billingDuration, setBillingDuration] = useState<BillingDuration>('per_month')
  const [deliverables, setDeliverables] = useState('Artwork display\nPrinting & installation\nWeekly proof photos')
  const [description, setDescription] = useState('')
  const [isDirectMedia, setIsDirectMedia] = useState(true)
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [error, setError] = useState('')
  const [hydrated, setHydrated] = useState(!initialListing)

  useEffect(() => {
    if (!initialListing) return
    setCategory(initialListing.mediaCategory)
    setSubcategory(initialListing.subcategory)
    setTitle(initialListing.title)
    setCity(initialListing.city as typeof UAE_CITIES[number])
    setArea(initialListing.area)
    setLandmark(initialListing.landmark)
    setSizeWidth(initialListing.sizeWidth)
    setSizeHeight(initialListing.sizeHeight)
    setSizeUnit(initialListing.sizeUnit)
    setAvailability(initialListing.availability)
    setPricingType(initialListing.pricingType)
    setPrice(String(initialListing.priceMin))
    setPriceMax(initialListing.priceMax > initialListing.priceMin ? String(initialListing.priceMax) : '')
    setBillingDuration(initialListing.billingDuration)
    setDeliverables(initialListing.deliverables.join('\n'))
    setDescription(initialListing.descriptionLong || initialListing.descriptionShort)
    setIsDirectMedia(initialListing.isDirectMedia)
    setDocuments(documentsFromListing(initialListing))
    setHydrated(true)
  }, [initialListing])

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

  const goToStep2 = () => {
    if (!title.trim()) {
      setError('Listing title is required')
      return
    }
    setError('')
    setStep(2)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      setError('A full description is required for advertisers to review your placement')
      return
    }
    const priceMin = Number(price) || 0
    const priceMaxVal = pricingType === 'range' ? Number(priceMax) || priceMin : priceMin
    const cityConfig = CITY_CONFIGS[city]
    const fallbackImage = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop'

    const listing: OwnerListing = {
      id: initialListing?.id ?? `ol_${Date.now()}`,
      agencyId,
      title: title.trim(),
      mediaCategory: category,
      mediaType: categoryToMediaType(category),
      subcategory,
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
      availability,
      descriptionShort: description.slice(0, 160),
      descriptionLong: description,
      imageUrl: heroImageFromDocuments(documents, fallbackImage),
      galleryImages: galleryFromDocuments(documents),
      deliverables: deliverables.split('\n').filter(Boolean),
      isDirectMedia,
      lat: cityConfig.lat,
      lng: cityConfig.lng,
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
              {CATEGORIES.map((c) => (
                <button key={c} type="button" onClick={() => { setCategory(c); setSubcategory(SUBCATEGORIES[c][0]) }}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${category === c ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-700'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Subcategory</label>
            <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm">
              {SUBCATEGORIES[category].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Listing Title *</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sheikh Zayed Road Digital Billboard"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">City</label>
            <select value={city} onChange={(e) => setCity(e.target.value as typeof city)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm">
              {UAE_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Pricing Type</label>
            <select value={pricingType} onChange={(e) => setPricingType(e.target.value as PricingType)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm">
              <option value="fixed">Fixed price</option>
              <option value="range">Price range</option>
              <option value="on_request">On request</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Price (AED)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
            </div>
            {pricingType === 'range' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Max price (AED)</label>
                <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Billing Duration</label>
              <select value={billingDuration} onChange={(e) => setBillingDuration(e.target.value as BillingDuration)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm">
                <option value="per_week">Per week</option>
                <option value="per_month">Per month</option>
                <option value="per_campaign">Per campaign</option>
                <option value="per_spot">Per spot</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="button" onClick={goToStep2}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white hover:bg-slate-800">
            Next: Add details <ArrowRight className="h-4 w-4" />
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-slate-500">Describe the placement — advertisers see this on the listing page after approval.</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Area / District *</label>
              <input required value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Financial Centre"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Nearby Landmark</label>
              <input value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="e.g. Near DIFC Gate"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Width</label>
              <input value={sizeWidth} onChange={(e) => setSizeWidth(e.target.value)} placeholder="14"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Height</label>
              <input value={sizeHeight} onChange={(e) => setSizeHeight(e.target.value)} placeholder="48"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Unit</label>
              <select value={sizeUnit} onChange={(e) => setSizeUnit(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm">
                <option value="m">Metres (m)</option>
                <option value="ft">Feet (ft)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Availability</label>
            <select value={availability} onChange={(e) => setAvailability(e.target.value as typeof availability)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm">
              <option value="immediate">Immediate</option>
              <option value="1-2-weeks">1–2 weeks</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Full Description *</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
              placeholder="Premium OOH placement with high visibility. Ideal for brand awareness, launches, and seasonal campaigns. Include audience reach, traffic data, and creative specs..."
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Deliverables (one per line)</label>
            <textarea value={deliverables} onChange={(e) => setDeliverables(e.target.value)} rows={4}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
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
            <button type="button" onClick={() => { setStep(1); setError('') }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
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
    </form>
  )
}
