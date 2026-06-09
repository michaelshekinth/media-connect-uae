import { Check, Crown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { getSubscription, subscribeToPackage } from '../services/userStore'
import { getSubscriptionPackages } from '../services/subscriptionService'
import type { AdminSubscriptionPackage } from '@shared/types/admin'
import type { AdvertiserSubscription } from '@shared/types/admin'

type OutletCtx = { showToast: (msg: string) => void }

export function SubscriptionPage() {
  const { showToast } = useOutletContext<OutletCtx>()
  const [packages, setPackages] = useState<AdminSubscriptionPackage[]>([])
  const [active, setActive] = useState<AdvertiserSubscription | null>(getSubscription())

  useEffect(() => {
    getSubscriptionPackages().then(setPackages).catch(() => setPackages([]))
  }, [])

  const handleSubscribe = async (pkg: AdminSubscriptionPackage) => {
    const sub = await subscribeToPackage(pkg)
    setActive(sub)
    showToast(`Subscribed to ${pkg.name} — ${pkg.contactViewsIncluded} contact views available`)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Subscription' }]} />
      <div className="mt-6 flex items-center gap-3">
        <Crown className="h-8 w-8 text-amber-500" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscription plans</h1>
          <p className="text-sm text-slate-600">Reveal media owner contact details on agency profiles</p>
        </div>
      </div>

      {active && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
          <p className="font-semibold">Active: {active.packageName}</p>
          <p className="mt-1">
            {active.contactViewsRemaining} contact view{active.contactViewsRemaining !== 1 ? 's' : ''} remaining ·
            expires {new Date(active.expiresAt).toLocaleDateString()}
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {packages.map((pkg) => (
          <div key={pkg.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">{pkg.name}</h2>
            <p className="mt-2 text-3xl font-bold text-indigo-600">
              {pkg.priceAed.toLocaleString()} <span className="text-base font-medium text-slate-500">AED</span>
            </p>
            <p className="text-sm text-slate-500">{pkg.durationDays} days · {pkg.contactViewsIncluded} contact reveals</p>
            <ul className="mt-4 flex-1 space-y-2">
              {pkg.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {f}
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => handleSubscribe(pkg)}
              className="mt-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-bold text-white hover:opacity-90">
              Subscribe
            </button>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        After subscribing, visit any <Link to="/browse" className="font-medium text-indigo-600 hover:underline">agency profile</Link> to reveal contact details.
      </p>
    </div>
  )
}
