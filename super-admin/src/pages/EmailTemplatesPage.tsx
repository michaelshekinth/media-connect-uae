import { useEffect, useState } from 'react'
import type { EmailTemplate } from '@shared/types/admin'
import { getAdminConfig, saveAdminConfig } from '../services/adminService'
import { Card, PageHeader, Toggle } from '../components/ui'

export function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => { getAdminConfig().then((c) => setTemplates(c.emailTemplates)) }, [])

  const saveTemplates = async (next: EmailTemplate[]) => {
    const config = await getAdminConfig()
    config.emailTemplates = next
    await saveAdminConfig(config)
    setTemplates(next)
  }

  const t = templates[active]
  if (!t) return null

  return (
    <div>
      <PageHeader title="Email Templates" subtitle="Manage notification email templates" />
      <div className="mb-4 flex flex-wrap gap-2">
        {templates.map((tpl, i) => (
          <button key={tpl.id} type="button" onClick={() => setActive(i)}
            className={`rounded-lg px-3 py-1.5 text-sm ${active === i ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>{tpl.name}</button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <input value={t.name} onChange={(e) => saveTemplates(templates.map((x, i) => i === active ? { ...x, name: e.target.value } : x))}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 font-semibold text-white" />
          <label className="mt-3 block text-xs text-slate-500">Subject</label>
          <input value={t.subject} onChange={(e) => saveTemplates(templates.map((x, i) => i === active ? { ...x, subject: e.target.value } : x))}
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white" />
          <label className="mt-3 block text-xs text-slate-500">Body</label>
          <textarea value={t.body} onChange={(e) => saveTemplates(templates.map((x, i) => i === active ? { ...x, body: e.target.value } : x))}
            rows={10} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white" />
          <div className="mt-3 flex items-center gap-2">
            <Toggle active={t.active} onChange={(v) => saveTemplates(templates.map((x, i) => i === active ? { ...x, active: v } : x))} />
            <span className="text-sm text-slate-400">{t.active ? 'Active' : 'Inactive'}</span>
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-400">Preview</h3>
          <p className="text-sm text-slate-500">Subject: {t.subject}</p>
          <div className="mt-4 rounded-lg border border-slate-600 bg-white p-4 text-sm text-slate-800">{t.body}</div>
        </Card>
      </div>
    </div>
  )
}
