import { useEffect, useState } from 'react'
import type { CmsPage as CmsPageType } from '@shared/types/admin'
import { getAdminConfig, saveAdminConfig, type HowItWorksConfig } from '../services/adminService'
import { Card, PageHeader } from '../components/ui'

const DEFAULT_EMIRATES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain']

export function CmsPage() {
  const [section, setSection] = useState<'pages' | 'hero' | 'howItWorks'>('pages')
  const [pages, setPages] = useState<CmsPageType[]>([])
  const [active, setActive] = useState(0)
  const [heroImages, setHeroImages] = useState<Record<string, string>>({})
  const [howItWorks, setHowItWorks] = useState<HowItWorksConfig>({ title: 'How it works', steps: [] })

  useEffect(() => {
    getAdminConfig().then((c) => {
      setPages(c.cmsPages)
      setHeroImages(c.heroImagesByEmirate ?? {})
      setHowItWorks(c.howItWorks ?? { title: 'How it works', steps: [] })
    })
  }, [])

  const savePages = async (next: CmsPageType[]) => {
    const config = await getAdminConfig()
    config.cmsPages = next
    await saveAdminConfig(config)
    setPages(next)
  }

  const saveHero = async (next: Record<string, string>) => {
    const config = await getAdminConfig()
    config.heroImagesByEmirate = next
    await saveAdminConfig(config)
    setHeroImages(next)
  }

  const saveHowItWorks = async (next: HowItWorksConfig) => {
    const config = await getAdminConfig()
    config.howItWorks = next
    await saveAdminConfig(config)
    setHowItWorks(next)
  }

  const p = pages[active]
  const emirates = [...new Set([...DEFAULT_EMIRATES, ...Object.keys(heroImages)])]

  return (
    <div>
      <PageHeader title="CMS" subtitle="Edit static pages, hero images, and how-it-works content" />
      <div className="mb-4 flex gap-2">
        <button type="button" onClick={() => setSection('pages')}
          className={`rounded-lg px-3 py-1.5 text-sm ${section === 'pages' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>Static pages</button>
        <button type="button" onClick={() => setSection('hero')}
          className={`rounded-lg px-3 py-1.5 text-sm ${section === 'hero' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>Hero images</button>
        <button type="button" onClick={() => setSection('howItWorks')}
          className={`rounded-lg px-3 py-1.5 text-sm ${section === 'howItWorks' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>How it works</button>
      </div>

      {section === 'pages' && p && (
        <>
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
        </>
      )}

      {section === 'hero' && (
        <Card>
          <h3 className="mb-4 font-semibold text-white">Hero images by emirate</h3>
          <div className="space-y-3">
            {emirates.map((emirate) => (
              <div key={emirate}>
                <label className="text-sm text-slate-400">{emirate}</label>
                <input value={heroImages[emirate] ?? ''} onChange={(e) => saveHero({ ...heroImages, [emirate]: e.target.value })}
                  placeholder="Image URL"
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {section === 'howItWorks' && (
        <Card>
          <label className="text-sm text-slate-400">Section title</label>
          <input value={howItWorks.title} onChange={(e) => saveHowItWorks({ ...howItWorks, title: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white" />
          <div className="mt-6 space-y-4">
            {howItWorks.steps.map((step, i) => (
              <div key={i} className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
                <input value={step.title} onChange={(e) => saveHowItWorks({
                  ...howItWorks,
                  steps: howItWorks.steps.map((s, j) => j === i ? { ...s, title: e.target.value } : s),
                })}
                  placeholder="Step title"
                  className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-sm text-white" />
                <textarea value={step.description} onChange={(e) => saveHowItWorks({
                  ...howItWorks,
                  steps: howItWorks.steps.map((s, j) => j === i ? { ...s, description: e.target.value } : s),
                })}
                  rows={2} placeholder="Step description"
                  className="mt-2 w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-sm text-white" />
                <button type="button" onClick={() => saveHowItWorks({ ...howItWorks, steps: howItWorks.steps.filter((_, j) => j !== i) })}
                  className="mt-2 text-xs text-red-400">Remove step</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => saveHowItWorks({ ...howItWorks, steps: [...howItWorks.steps, { title: 'New step', description: '' }] })}
            className="mt-4 rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300">Add step</button>
        </Card>
      )}
    </div>
  )
}
