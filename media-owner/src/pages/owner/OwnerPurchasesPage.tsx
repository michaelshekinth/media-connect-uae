import { Crown, Sparkles, UserCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useOwnerAuth } from '../../context/OwnerAuthContext'
import {
  getOwnerFeatures,
  submitOwnerPurchase,
  type OwnerFeatures,
} from '../../services/ownerStore'

export function OwnerPurchasesPage() {
  const { user } = useOwnerAuth()
  const agencyId = user?.agencyId ?? ''
  const [features, setFeatures] = useState<OwnerFeatures | null>(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!agencyId) return
    getOwnerFeatures(agencyId).then(setFeatures).catch(() => setFeatures(null))
  }, [agencyId])

  const requestPurchase = async (packageId: string) => {
    if (!agencyId) return
    setSubmitting(packageId)
    setMessage('')
    try {
      const res = await submitOwnerPurchase(packageId, notes.trim() || undefined)
      setMessage(`Purchase request submitted (${res.requestId}). Our team will contact you shortly.`)
      setNotes('')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Could not submit request')
    } finally {
      setSubmitting(null)
    }
  }

  const packages = [
    {
      id: 'featured_listing',
      icon: Sparkles,
      name: 'Featured placement',
      description: 'Boost visibility in browse results and emirate hero sections.',
      price: 'From 1,500 AED / month',
    },
    {
      id: 'contact_reveal',
      icon: UserCheck,
      name: 'Advertiser contact reveals',
      description: 'Unlock direct advertiser email on qualified RFQs from your leads inbox.',
      price: 'From 299 AED / month',
    },
    {
      id: 'listing_bundle',
      icon: Crown,
      name: 'Listing fee bundle',
      description: 'Pre-pay listing fees for multiple placements at a discounted rate.',
      price: 'Custom quote',
    },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/dashboard/chats" className="text-sm font-medium text-slate-600 hover:text-slate-900">
        ← Back to dashboard
      </Link>
      <div className="mt-4 flex items-center gap-3">
        <Crown className="h-8 w-8 text-amber-500" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchases & upgrades</h1>
          <p className="text-sm text-slate-600">Request featured placement, contact reveals, and commercial add-ons</p>
        </div>
      </div>

      {features && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Featured status</p>
            <p className="mt-1 font-semibold text-slate-900">
              {features.featured ? 'Active' : 'Not active'}
            </p>
            {features.featured && features.featuredUntil && (
              <p className="mt-1 text-xs text-slate-500">
                Until {new Date(features.featuredUntil).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Contact reveals</p>
            <p className="mt-1 font-semibold text-slate-900">
              {features.canViewAdvertiserContact ? 'Enabled' : 'Not enabled'}
            </p>
            {features.canViewAdvertiserContact && (
              <p className="mt-1 text-xs text-slate-500">
                {features.contactRevealsUsed} / {features.contactRevealLimit || '∞'} used this period
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Pricing model</p>
            <p className="mt-1 font-semibold text-slate-900">
              {features.pricingModel?.listingFees?.active ? 'Listing fees on' : 'Standard'}
            </p>
            {features.pricingModel?.leadGenFees?.active && (
              <p className="mt-1 text-xs text-slate-500">
                Lead gen: {features.pricingModel.leadGenFees.amount} AED
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {packages.map((pkg) => (
          <div key={pkg.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                <pkg.icon className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">{pkg.name}</h2>
                <p className="mt-1 text-sm text-slate-600">{pkg.description}</p>
                <p className="mt-1 text-sm font-medium text-slate-800">{pkg.price}</p>
              </div>
            </div>
            <button
              type="button"
              disabled={submitting === pkg.id}
              onClick={() => requestPurchase(pkg.id)}
              className="shrink-0 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting === pkg.id ? 'Submitting…' : 'Request purchase'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <label className="mb-1 block text-sm font-medium text-slate-700">Notes for our commercial team (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Campaign dates, preferred emirates, billing contact…"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
        />
      </div>

      {message && (
        <p className={`mt-4 text-sm ${message.includes('submitted') ? 'text-emerald-700' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
