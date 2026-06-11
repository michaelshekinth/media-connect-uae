import { useEffect, useState } from 'react'
import type { BrowseCategory } from '@shared/types/user'
import type { MediaType } from '@shared/types'
import { MEDIA_CATEGORIES, MEDIA_CATEGORY_LABELS } from '@shared/constants'
import { fetchSubcategories } from '@shared/services/publicApi'

const categories: { id: BrowseCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'direct', label: 'Direct Media' },
  ...MEDIA_CATEGORIES.map((t) => ({ id: t as BrowseCategory, label: MEDIA_CATEGORY_LABELS[t] })),
]

interface CategoryFilterBarProps {
  active: BrowseCategory
  subcategory: string
  onChange: (cat: BrowseCategory) => void
  onSubcategoryChange: (subcategory: string) => void
}

export function CategoryFilterBar({
  active,
  subcategory,
  onChange,
  onSubcategoryChange,
}: CategoryFilterBarProps) {
  const [subcategories, setSubcategories] = useState<{ id: string; name: string }[]>([])
  const mediaCategory =
    active !== 'all' && active !== 'direct' ? (active as MediaType) : null

  useEffect(() => {
    if (!mediaCategory) {
      setSubcategories([])
      return
    }
    let cancelled = false
    fetchSubcategories(mediaCategory)
      .then((subs) => {
        if (!cancelled) setSubcategories(subs.map((s) => ({ id: s.name, name: s.name })))
      })
      .catch(() => {
        if (!cancelled) setSubcategories([])
      })
    return () => {
      cancelled = true
    }
  }, [mediaCategory])

  return (
    <div className="sticky top-20 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
          {categories.map((cat) => {
            const isActive = active === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChange(cat.id)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-700'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
        {mediaCategory && subcategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            <button
              type="button"
              onClick={() => onSubcategoryChange('all')}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                subcategory === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              All subcategories
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSubcategoryChange(sub.name)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  subcategory === sub.name
                    ? 'bg-slate-800 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
