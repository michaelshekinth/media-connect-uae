import { useEffect, useState } from 'react'
import type { LeadGenFeeRule } from '@shared/types/admin'
import { getAdminConfig, saveAdminConfig } from '../services/adminService'
import { Card, PageHeader, Toggle } from '../components/ui'

const SCOPES = ['global', 'rfq', 'category', 'city', 'owner', 'custom'] as const

export function FeesLeadsPage() {
  const [rules, setRules] = useState<LeadGenFeeRule[]>([])

  useEffect(() => { getAdminConfig().then((c) => setRules(c.leadGenFees)) }, [])

  const save = async (next: LeadGenFeeRule[]) => {
    const config = await getAdminConfig()
    config.leadGenFees = next
    await saveAdminConfig(config)
    setRules(next)
  }

  const addRule = () => {
    save([...rules, { id: `lgf_${Date.now()}`, scope: 'global', amountAed: 50, active: true, meta: { label: 'New rule' } }])
  }

  const updateRule = (id: string, patch: Partial<LeadGenFeeRule>) => {
    save(rules.map((r) => (r.id === id ? { ...r, ...patch, meta: { ...r.meta, ...patch.meta } } : r)))
  }

  return (
    <div>
      <PageHeader title="Lead Generation Fees" subtitle="Per RFQ, category, city, owner, or custom"
        action={<button type="button" onClick={addRule} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900">Add rule</button>} />
      <div className="space-y-4">
        {rules.map((r) => (
          <Card key={r.id}>
            <div className="flex flex-wrap items-center gap-4">
              <select value={r.scope} onChange={(e) => updateRule(r.id, { scope: e.target.value as LeadGenFeeRule['scope'] })}
                className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white">
                {SCOPES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input value={r.meta?.label ?? ''} onChange={(e) => updateRule(r.id, { meta: { label: e.target.value } })}
                placeholder="Label / custom name" className="min-w-[160px] rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white" />
              <input type="number" value={r.amountAed} onChange={(e) => updateRule(r.id, { amountAed: Number(e.target.value) })}
                className="w-28 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white" />
              <span className="text-sm text-slate-500">AED</span>
              <Toggle active={r.active} onChange={(v) => updateRule(r.id, { active: v })} />
              <span className="text-sm text-slate-400">{r.active ? 'Active' : 'Inactive'}</span>
              <button type="button" onClick={() => save(rules.filter((x) => x.id !== r.id))} className="text-sm text-red-400">Delete</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
