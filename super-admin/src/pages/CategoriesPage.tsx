import { useEffect, useState } from 'react'
import type { CategoryConfig } from '@shared/types/admin'
import { getAdminConfig, saveAdminConfig } from '../services/adminService'
import { MEDIA_TYPES } from '@shared/constants'
import { Card, PageHeader, Toggle } from '../components/ui'

export function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryConfig[]>([])

  useEffect(() => { getAdminConfig().then((c) => setCategories(c.categories)) }, [])

  const save = async (next: CategoryConfig[]) => {
    const config = await getAdminConfig()
    config.categories = next
    await saveAdminConfig(config)
    setCategories(next)
  }

  const addCategory = () => {
    save([...categories, {
      id: `cat_${Date.now()}`, label: 'New Category', mediaType: 'OOH', active: true, sortOrder: categories.length + 1,
    }])
  }

  return (
    <div>
      <PageHeader title="Categories" subtitle="Manage marketplace media categories"
        action={<button type="button" onClick={addCategory} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900">Add category</button>} />
      <div className="space-y-3">
        {categories.map((c) => (
          <Card key={c.id}>
            <div className="flex flex-wrap items-center gap-3">
              <input value={c.label} onChange={(e) => save(categories.map((x) => x.id === c.id ? { ...x, label: e.target.value } : x))}
                className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white" />
              <select value={c.mediaType} onChange={(e) => save(categories.map((x) => x.id === c.id ? { ...x, mediaType: e.target.value as CategoryConfig['mediaType'] } : x))}
                className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white">
                {MEDIA_TYPES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <input type="number" value={c.sortOrder} onChange={(e) => save(categories.map((x) => x.id === c.id ? { ...x, sortOrder: Number(e.target.value) } : x))}
                className="w-16 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-sm text-white" />
              <Toggle active={c.active} onChange={(v) => save(categories.map((x) => x.id === c.id ? { ...x, active: v } : x))} />
              <button type="button" onClick={() => save(categories.filter((x) => x.id !== c.id))} className="text-sm text-red-400">Delete</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
