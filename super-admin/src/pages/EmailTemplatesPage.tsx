import { useEffect, useMemo, useState } from 'react'
import type { EmailTemplate } from '@shared/types/admin'
import { ADVERTISER_URL, ADMIN_URL, MEDIA_OWNER_URL } from '@shared/constants/portals'
import { getAdminConfig, saveAdminConfig } from '../services/adminService'
import { Card, PageHeader, Toggle } from '../components/ui'

function renderTemplatePreview(subject: string, body: string): { subject: string; body: string } {
  const vars: Record<string, string> = {
    name: 'Sample User',
    title: 'Sample Listing',
    advertiser: 'Sample Advertiser',
    package: 'Professional',
    ownerUrl: MEDIA_OWNER_URL,
    advertiserUrl: ADVERTISER_URL,
    adminUrl: ADMIN_URL,
  }

  const replaceVars = (text: string) => {
    let out = text
    for (const [key, value] of Object.entries(vars)) {
      out = out.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
    }
    out = out.replace(/(?<![\w:/])(\/owner\/[^\s"'<>]*)/g, `${MEDIA_OWNER_URL}$1`)
    out = out.replace(/(?<![\w:/])(\/admin\/[^\s"'<>]*)/g, `${ADMIN_URL}$1`)
    out = out.replace(/(?<![\w:/])(\/(?!owner|admin)[^\s"'<>]*)/g, `${ADVERTISER_URL}$1`)
    return out
  }

  return { subject: replaceVars(subject), body: replaceVars(body) }
}

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
  const preview = useMemo(() => t ? renderTemplatePreview(t.subject, t.body) : null, [t])

  if (!t || !preview) return null

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
          <p className="mt-2 text-xs text-slate-500">
            Preview resolves deep links using env URLs: advertiser {ADVERTISER_URL}, publisher {MEDIA_OWNER_URL}, admin {ADMIN_URL}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Toggle active={t.active} onChange={(v) => saveTemplates(templates.map((x, i) => i === active ? { ...x, active: v } : x))} />
            <span className="text-sm text-slate-400">{t.active ? 'Active' : 'Inactive'}</span>
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-400">Preview</h3>
          <p className="text-sm text-slate-500">Subject: {preview.subject}</p>
          <div className="mt-4 whitespace-pre-wrap rounded-lg border border-slate-600 bg-white p-4 text-sm text-slate-800">{preview.body}</div>
        </Card>
      </div>
    </div>
  )
}
