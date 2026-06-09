import { useEffect, useState } from 'react'
import type { CommissionRule } from '@shared/types/admin'
import { getAdminConfig, saveAdminConfig } from '../services/adminService'
import { Card, PageHeader, Toggle } from '../components/ui'

export function FeesCommissionsPage() {
  const [rules, setRules] = useState<CommissionRule[]>([])

  useEffect(() => { getAdminConfig().then((c) => setRules(c.commissionRules)) }, [])

  const save = async (next: CommissionRule[]) => {
    const config = await getAdminConfig()
    config.commissionRules = next
    await saveAdminConfig(config)
    setRules(next)
  }

  const addRule = () => {
    save([...rules, { id: `comm_${Date.now()}`, scope: 'global', percent: 10, active: true, meta: { label: 'New rule' } }])
  }

  const updateRule = (id: string, patch: Partial<CommissionRule>) => {
    save(rules.map((r) => (r.id === id ? { ...r, ...patch, meta: { ...r.meta, ...patch.meta } } : r)))
  }

  return (
    <div>
      <PageHeader title="Commissions" subtitle="Global, category, and custom commission percentages"
        action={<button type="button" onClick={addRule} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900">Add rule</button>} />
      <div className="space-y-4">
        {rules.map((r) => (
          <Card key={r.id}>
            <div className="flex flex-wrap items-center gap-4">
              <select value={r.scope} onChange={(e) => updateRule(r.id, { scope: e.target.value as CommissionRule['scope'] })}
                className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white">
                <option value="global">Global</option>
                <option value="category">Category</option>
                <option value="custom">Custom</option>
              </select>
              <input value={r.meta?.label ?? ''} onChange={(e) => updateRule(r.id, { meta: { label: e.target.value } })}
                placeholder="Label" className="min-w-[140px] rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white" />
              <input type="number" value={r.percent} onChange={(e) => updateRule(r.id, { percent: Number(e.target.value) })}
                className="w-20 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white" />
              <span className="text-sm text-slate-500">%</span>
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
