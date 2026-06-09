import type { BrowseCategory } from '@shared/types/user'
import { MEDIA_TYPES } from '@shared/constants'

const categories: { id: BrowseCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'direct', label: 'Direct Media' },
  ...MEDIA_TYPES.map((t) => ({ id: t as BrowseCategory, label: t })),
]

interface CategoryFilterBarProps {
  active: BrowseCategory
  onChange: (cat: BrowseCategory) => void
}

export function CategoryFilterBar({ active, onChange }: CategoryFilterBarProps) {
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
      </div>
    </div>
  )
}
