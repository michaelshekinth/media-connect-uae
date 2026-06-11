import { useEffect, useState } from 'react'
import type { ListingFeeRule } from '@shared/types/admin'
import { getAdminConfig, saveAdminConfig } from '../services/adminService'
import { getAllMediaOwners } from '../services/adminService'
import { Card, PageHeader, Toggle } from '../components/ui'

export function FeesListingPage() {
  const [rules, setRules] = useState<ListingFeeRule[]>([])
  const [owners, setOwners] = useState<{ agencyId: string; companyName: string }[]>([])

  const load = () => getAdminConfig().then((c) => setRules(c.listingFees))
  useEffect(() => {
    load()
    getAllMediaOwners().then((o) => setOwners(o.map((x) => ({ agencyId: x.agencyId!, companyName: x.companyName || x.agencyId! }))))
  }, [])

  const save = async (next: ListingFeeRule[]) => {
    const config = await getAdminConfig()
    config.listingFees = next
    await saveAdminConfig(config)
    setRules(next)
  }

  const addRule = () => {
    const rule: ListingFeeRule = {
      id: `lf_${Date.now()}`, scope: 'global', billing: 'per_listing', amountAed: 0, active: true,
    }
    save([...rules, rule])
  }

  const addOwnerRule = (ownerId: string) => {
    const rule: ListingFeeRule = {
      id: `lf_${Date.now()}`, scope: 'owner', ownerId, billing: 'free', amountAed: 0, active: true,
    }
    save([...rules, rule])
  }

  const updateRule = (id: string, patch: Partial<ListingFeeRule>) => {
    save(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  return (
    <div>
      <PageHeader title="Listing Fees" subtitle="Global and per-publisher listing fee rules"
        action={<button type="button" onClick={addRule} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900">Add rule</button>} />
      <div className="space-y-4">
        {rules.map((r) => (
          <Card key={r.id}>
            <div className="flex flex-wrap items-center gap-4">
              <select value={r.scope} onChange={(e) => updateRule(r.id, { scope: e.target.value as ListingFeeRule['scope'] })}
                className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white">
                <option value="global">Global</option>
                <option value="owner">Publisher</option>
              </select>
              {r.scope === 'owner' && (
                <select value={r.ownerId ?? ''} onChange={(e) => updateRule(r.id, { ownerId: e.target.value })}
                  className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white">
                  <option value="">Select owner</option>
                  {owners.map((o) => <option key={o.agencyId} value={o.agencyId}>{o.companyName}</option>)}
                </select>
              )}
              <select value={r.billing} onChange={(e) => updateRule(r.id, { billing: e.target.value as ListingFeeRule['billing'] })}
                className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white">
                <option value="free">Free</option>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
                <option value="per_listing">Per listing</option>
              </select>
              <input type="number" value={r.amountAed} onChange={(e) => updateRule(r.id, { amountAed: Number(e.target.value) })}
                className="w-28 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white" placeholder="AED" />
              <div className="flex items-center gap-2">
                <Toggle active={r.active} onChange={(v) => updateRule(r.id, { active: v })} />
                <span className="text-sm text-slate-400">{r.active ? 'Active' : 'Inactive'}</span>
              </div>
              <button type="button" onClick={() => save(rules.filter((x) => x.id !== r.id))} className="text-sm text-red-400">Delete</button>
            </div>
          </Card>
        ))}
      </div>
      {owners.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-sm text-slate-400">Quick add partner override:</p>
          <select onChange={(e) => { if (e.target.value) { addOwnerRule(e.target.value); e.target.value = '' } }}
            className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white">
            <option value="">Add fee for publisher...</option>
            {owners.map((o) => <option key={o.agencyId} value={o.agencyId}>{o.companyName}</option>)}
          </select>
        </div>
      )}
    </div>
  )
}
