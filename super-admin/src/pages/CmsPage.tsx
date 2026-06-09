import { useEffect, useState } from 'react'
import type { CmsPage as CmsPageType } from '@shared/types/admin'
import { getAdminConfig, saveAdminConfig } from '../services/adminService'
import { Card, PageHeader } from '../components/ui'

export function CmsPage() {
  const [pages, setPages] = useState<CmsPageType[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => { getAdminConfig().then((c) => setPages(c.cmsPages)) }, [])

  const savePages = async (next: CmsPageType[]) => {
    const config = await getAdminConfig()
    config.cmsPages = next
    await saveAdminConfig(config)
    setPages(next)
  }

  const p = pages[active]
  if (!p) return null

  return (
    <div>
      <PageHeader title="CMS" subtitle="Edit static platform pages" />
      <div className="mb-4 flex gap-2">
        {pages.map((page, i) => (
          <button key={page.slug} type="button" onClick={() => setActive(i)}
            className={`rounded-lg px-3 py-1.5 text-sm capitalize ${active === i ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>{page.slug}</button>
        ))}
      </div>
      <Card>
        <input value={p.title} onChange={(e) => savePages(pages.map((x, i) => i === active ? { ...x, title: e.target.value } : x))}
          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-lg font-semibold text-white" />
        <textarea value={p.body} onChange={(e) => savePages(pages.map((x, i) => i === active ? { ...x, body: e.target.value } : x))}
          rows={12} className="mt-4 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white" />
      </Card>
    </div>
  )
}
