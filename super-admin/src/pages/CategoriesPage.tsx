import { useCallback, useEffect, useState } from 'react'
import type { CategoryConfig } from '@shared/types/admin'
import {
  createSubcategory,
  deleteSubcategory,
  getAdminConfig,
  getSubcategories,
  saveAdminConfig,
  updateSubcategory,
  type AdminSubcategory,
} from '../services/adminService'
import { MEDIA_TYPES } from '@shared/constants'
import { Card, PageHeader, Toggle } from '../components/ui'

export function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryConfig[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [subcategories, setSubcategories] = useState<AdminSubcategory[]>([])
  const [newSubName, setNewSubName] = useState('')

  const loadSubcategories = useCallback(async (categoryId: string) => {
    const subs = await getSubcategories(categoryId)
    setSubcategories(subs)
  }, [])

  useEffect(() => {
    getAdminConfig().then((c) => {
      setCategories(c.categories)
      setSelectedCategoryId((prev) => prev ?? c.categories[0]?.id ?? null)
    })
  }, [])

  useEffect(() => {
    if (selectedCategoryId) loadSubcategories(selectedCategoryId)
  }, [selectedCategoryId, loadSubcategories])

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

  const addSubcategory = async () => {
    if (!selectedCategoryId || !newSubName.trim()) return
    await createSubcategory({ categoryId: selectedCategoryId, name: newSubName.trim(), sortOrder: subcategories.length + 1 })
    setNewSubName('')
    await loadSubcategories(selectedCategoryId)
  }

  const patchSubcategory = async (id: string, patch: Partial<AdminSubcategory>) => {
    await updateSubcategory(id, patch)
    if (selectedCategoryId) await loadSubcategories(selectedCategoryId)
  }

  const removeSubcategory = async (id: string) => {
    await deleteSubcategory(id)
    if (selectedCategoryId) await loadSubcategories(selectedCategoryId)
  }

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)

  return (
    <div>
      <PageHeader title="Categories" subtitle="Manage marketplace media categories and subcategories"
        action={<button type="button" onClick={addCategory} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900">Add category</button>} />
      <div className="space-y-3">
        {categories.map((c) => (
          <Card key={c.id}>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => setSelectedCategoryId(c.id)}
                className={`rounded-lg px-2 py-1 text-xs font-semibold ${selectedCategoryId === c.id ? 'bg-amber-500/20 text-amber-300' : 'text-slate-500 hover:text-slate-300'}`}>
                Subcategories
              </button>
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

      {selectedCategory && (
        <Card className="mt-8">
          <h3 className="mb-4 font-semibold text-white">Subcategories — {selectedCategory.label}</h3>
          <div className="mb-4 flex flex-wrap gap-2">
            <input value={newSubName} onChange={(e) => setNewSubName(e.target.value)} placeholder="New subcategory name"
              className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white" />
            <button type="button" onClick={addSubcategory} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900">Add subcategory</button>
          </div>
          <div className="space-y-2">
            {subcategories.length === 0 ? (
              <p className="text-sm text-slate-500">No subcategories for this category yet.</p>
            ) : subcategories.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2">
                <input value={s.name} onChange={(e) => patchSubcategory(s.id, { name: e.target.value })}
                  className="rounded border border-slate-600 bg-slate-900 px-2 py-1 text-sm text-white" />
                <input type="number" value={s.sortOrder} onChange={(e) => patchSubcategory(s.id, { sortOrder: Number(e.target.value) })}
                  className="w-16 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-sm text-white" />
                <Toggle active={s.active} onChange={(v) => patchSubcategory(s.id, { active: v })} />
                <button type="button" onClick={() => removeSubcategory(s.id)} className="text-sm text-red-400">Delete</button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
