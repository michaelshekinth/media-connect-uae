import { useEffect, useState } from 'react'
import type { AdminSubscriptionPackage } from '@shared/types/admin'
import { getAdminConfig, saveAdminConfig } from '../services/adminService'
import { Card, PageHeader, Toggle } from '../components/ui'

export function SubscriptionsPage() {
  const [packages, setPackages] = useState<AdminSubscriptionPackage[]>([])

  useEffect(() => { getAdminConfig().then((c) => setPackages(c.subscriptionPackages)) }, [])

  const save = async (next: AdminSubscriptionPackage[]) => {
    const config = await getAdminConfig()
    config.subscriptionPackages = next
    await saveAdminConfig(config)
    setPackages(next)
  }

  const addPackage = () => {
    save([...packages, {
      id: `pkg_${Date.now()}`, name: 'New Package', priceAed: 0, durationDays: 30,
      contactViewsIncluded: 5, features: ['Feature 1'], active: true,
    }])
  }

  const updatePkg = (id: string, patch: Partial<AdminSubscriptionPackage>) => {
    save(packages.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  return (
    <div>
      <PageHeader title="Subscription Packages" subtitle="Dynamic packages shown to advertisers for contact reveal"
        action={<button type="button" onClick={addPackage} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900">Add package</button>} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((p) => (
          <Card key={p.id}>
            <input value={p.name} onChange={(e) => updatePkg(p.id, { name: e.target.value })}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-lg font-semibold text-white" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500">Price (AED)</label>
                <input type="number" value={p.priceAed} onChange={(e) => updatePkg(p.id, { priceAed: Number(e.target.value) })}
                  className="mt-1 w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Days</label>
                <input type="number" value={p.durationDays} onChange={(e) => updatePkg(p.id, { durationDays: Number(e.target.value) })}
                  className="mt-1 w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-sm text-white" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-500">Contact views</label>
                <input type="number" value={p.contactViewsIncluded} onChange={(e) => updatePkg(p.id, { contactViewsIncluded: Number(e.target.value) })}
                  className="mt-1 w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-sm text-white" />
              </div>
            </div>
            <textarea value={p.features.join('\n')} onChange={(e) => updatePkg(p.id, { features: e.target.value.split('\n').filter(Boolean) })}
              rows={3} placeholder="Features (one per line)" className="mt-3 w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-sm text-white" />
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Toggle active={p.active} onChange={(v) => updatePkg(p.id, { active: v })} />
                <span className="text-sm text-slate-400">{p.active ? 'Active' : 'Inactive'}</span>
              </div>
              <button type="button" onClick={() => save(packages.filter((x) => x.id !== p.id))} className="text-sm text-red-400">Delete</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
