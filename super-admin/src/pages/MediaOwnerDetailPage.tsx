import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  delistListing,
  getMediaOwnerDetail,
  getPublisherPricingModel,
  savePublisherPricingModel,
  updateAgencyFeatured,
  type AgencyFeatured,
  type PublisherPricingModel,
} from '../services/adminService'
import { Card, PageHeader, StatusBadge, Toggle } from '../components/ui'

const EMIRATES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain']

export function MediaOwnerDetailPage() {
  const { agencyId } = useParams<{ agencyId: string }>()
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof getMediaOwnerDetail>> | null>(null)
  const [pricing, setPricing] = useState<PublisherPricingModel | null>(null)
  const [featured, setFeatured] = useState<AgencyFeatured>({
    featured: false,
    featuredFrom: null,
    featuredUntil: null,
    featuredCities: [],
  })
  const [savingPricing, setSavingPricing] = useState(false)
  const [savingFeatured, setSavingFeatured] = useState(false)

  const refresh = useCallback(async () => {
    if (!agencyId) return
    const d = await getMediaOwnerDetail(agencyId)
    setDetail(d)
    const model = await getPublisherPricingModel(agencyId)
    setPricing(model ?? {
      agencyId,
      listingFees: { mode: 'free', amount: 0, active: false },
      leadGenFees: { mode: 'free', amount: 0, active: false },
      commission: { mode: 'free', rate: 0, active: false },
      canViewAdvertiserContact: false,
      contactRevealLimit: 0,
      contactRevealsUsed: 0,
    })
  }, [agencyId])

  useEffect(() => { refresh() }, [refresh])

  const handleSavePricing = async () => {
    if (!agencyId || !pricing) return
    setSavingPricing(true)
    try {
      const saved = await savePublisherPricingModel(agencyId, pricing)
      setPricing(saved)
    } finally {
      setSavingPricing(false)
    }
  }

  const handleSaveFeatured = async () => {
    if (!agencyId) return
    setSavingFeatured(true)
    try {
      const saved = await updateAgencyFeatured(agencyId, featured)
      setFeatured({
        featured: saved.featured ?? false,
        featuredFrom: saved.featuredFrom ?? null,
        featuredUntil: saved.featuredUntil ?? null,
        featuredCities: saved.featuredCities ?? [],
      })
    } finally {
      setSavingFeatured(false)
    }
  }

  const handleDelist = async (listingId: string) => {
    if (!agencyId || !confirm('Delist this listing? It will be archived.')) return
    await delistListing(agencyId, listingId)
    await refresh()
  }

  if (!detail || !pricing) return <p className="text-slate-400">Loading...</p>
  const { user, data } = detail
  const p = data.companyProfile

  return (
    <div>
      <PageHeader title={user.companyName || p?.companyLegalName || 'Publisher'}
        action={<Link to="/media-owners" className="text-sm text-slate-400">← Back</Link>} />
      <div className="mb-4"><StatusBadge status={user.ownerApprovalStatus ?? 'draft'} /></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold text-white">Company profile</h3>
          {p ? (
            <dl className="space-y-2 text-sm text-slate-300">
              <div><dt className="text-slate-500">Legal name</dt><dd>{p.companyLegalName}</dd></div>
              <div><dt className="text-slate-500">Authorized</dt><dd>{p.authorizedPerson}</dd></div>
              <div><dt className="text-slate-500">Phone</dt><dd>{p.phone}</dd></div>
              <div><dt className="text-slate-500">License</dt><dd>{p.licenseNumber} (exp {p.licenseExpiry})</dd></div>
              <div><dt className="text-slate-500">Categories</dt><dd>{p.mediaCategories.join(', ')}</dd></div>
              <div><dt className="text-slate-500">Documents</dt><dd>{p.documents.map((d) => d.label).join(', ') || 'None'}</dd></div>
            </dl>
          ) : <p className="text-slate-500">No profile saved</p>}
        </Card>
        <Card>
          <h3 className="mb-3 font-semibold text-white">Listings ({data.listings.length})</h3>
          <ul className="space-y-2 text-sm">
            {data.listings.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 text-slate-300">
                <span>{l.title}</span>
                <div className="flex items-center gap-2">
                  <StatusBadge status={l.status} />
                  {l.status === 'approved' && (
                    <button type="button" onClick={() => handleDelist(l.id)}
                      className="rounded bg-red-600/80 px-2 py-0.5 text-xs font-semibold text-white">Delist</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <h3 className="mb-2 mt-6 font-semibold text-white">Leads / RFQs ({data.leads.length})</h3>
          <p className="text-sm text-slate-400">{data.leads.length} inbound requests</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold text-white">Pricing model</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="mb-2 text-slate-400">Listing fees</p>
              <div className="flex flex-wrap gap-2">
                <select value={pricing.listingFees.mode} onChange={(e) => setPricing({ ...pricing, listingFees: { ...pricing.listingFees, mode: e.target.value } })}
                  className="rounded border border-slate-600 bg-slate-900 px-2 py-1 text-white">
                  <option value="free">Free</option>
                  <option value="monthly">Monthly</option>
                  <option value="per_listing">Per listing</option>
                </select>
                <input type="number" value={pricing.listingFees.amount} onChange={(e) => setPricing({ ...pricing, listingFees: { ...pricing.listingFees, amount: Number(e.target.value) } })}
                  className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-white" />
                <Toggle active={pricing.listingFees.active} onChange={(v) => setPricing({ ...pricing, listingFees: { ...pricing.listingFees, active: v } })} />
              </div>
            </div>
            <div>
              <p className="mb-2 text-slate-400">Lead gen fees</p>
              <div className="flex flex-wrap gap-2">
                <select value={pricing.leadGenFees.mode} onChange={(e) => setPricing({ ...pricing, leadGenFees: { ...pricing.leadGenFees, mode: e.target.value } })}
                  className="rounded border border-slate-600 bg-slate-900 px-2 py-1 text-white">
                  <option value="free">Free</option>
                  <option value="per_lead">Per lead</option>
                </select>
                <input type="number" value={pricing.leadGenFees.amount} onChange={(e) => setPricing({ ...pricing, leadGenFees: { ...pricing.leadGenFees, amount: Number(e.target.value) } })}
                  className="w-24 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-white" />
                <Toggle active={pricing.leadGenFees.active} onChange={(v) => setPricing({ ...pricing, leadGenFees: { ...pricing.leadGenFees, active: v } })} />
              </div>
            </div>
            <div>
              <p className="mb-2 text-slate-400">Commission</p>
              <div className="flex flex-wrap gap-2">
                <input type="number" value={pricing.commission.rate} onChange={(e) => setPricing({ ...pricing, commission: { ...pricing.commission, rate: Number(e.target.value) } })}
                  className="w-20 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-white" placeholder="%" />
                <Toggle active={pricing.commission.active} onChange={(v) => setPricing({ ...pricing, commission: { ...pricing.commission, active: v } })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Toggle active={pricing.canViewAdvertiserContact} onChange={(v) => setPricing({ ...pricing, canViewAdvertiserContact: v })} />
              <span className="text-slate-300">Can view advertiser contact</span>
            </div>
            <div>
              <label className="text-slate-400">Contact reveal limit (0 = unlimited)</label>
              <input type="number" value={pricing.contactRevealLimit} onChange={(e) => setPricing({ ...pricing, contactRevealLimit: Number(e.target.value) })}
                className="mt-1 w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-white" />
              <p className="mt-1 text-xs text-slate-500">Used this period: {pricing.contactRevealsUsed}</p>
            </div>
          </div>
          <button type="button" onClick={handleSavePricing} disabled={savingPricing}
            className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50">
            {savingPricing ? 'Saving…' : 'Save pricing model'}
          </button>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold text-white">Featured scheduling</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Toggle active={featured.featured} onChange={(v) => setFeatured({ ...featured, featured: v })} />
              <span className="text-slate-300">Featured publisher</span>
            </div>
            <div>
              <label className="text-slate-400">Featured from</label>
              <input type="datetime-local" value={featured.featuredFrom?.slice(0, 16) ?? ''}
                onChange={(e) => setFeatured({ ...featured, featuredFrom: e.target.value ? new Date(e.target.value).toISOString() : null })}
                className="mt-1 w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-white" />
            </div>
            <div>
              <label className="text-slate-400">Featured until</label>
              <input type="datetime-local" value={featured.featuredUntil?.slice(0, 16) ?? ''}
                onChange={(e) => setFeatured({ ...featured, featuredUntil: e.target.value ? new Date(e.target.value).toISOString() : null })}
                className="mt-1 w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-white" />
            </div>
            <div>
              <label className="text-slate-400">Featured cities</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {EMIRATES.map((city) => (
                  <label key={city} className="flex items-center gap-1 text-slate-300">
                    <input type="checkbox" checked={featured.featuredCities.includes(city)}
                      onChange={(e) => setFeatured({
                        ...featured,
                        featuredCities: e.target.checked
                          ? [...featured.featuredCities, city]
                          : featured.featuredCities.filter((c) => c !== city),
                      })} />
                    {city}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button type="button" onClick={handleSaveFeatured} disabled={savingFeatured}
            className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50">
            {savingFeatured ? 'Saving…' : 'Save featured schedule'}
          </button>
        </Card>
      </div>
    </div>
  )
}
