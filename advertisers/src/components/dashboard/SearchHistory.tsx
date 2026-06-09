import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearSearchHistory, getSearchHistory } from '../../services/userStore'
import type { SearchHistoryEntry } from '@shared/types/user'
import { browsePathFromFilters } from '@shared/utils/searchParams'

export function SearchHistory() {
  const navigate = useNavigate()
  const [history, setHistory] = useState<SearchHistoryEntry[]>([])

  const refresh = () => getSearchHistory().then(setHistory).catch(() => setHistory([]))

  useEffect(() => {
    refresh()
  }, [])

  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center">
        <p className="text-slate-600">No search history yet.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={async () => { await clearSearchHistory(); refresh() }}
          className="text-sm font-medium text-red-600 hover:text-red-700">
          Clear history
        </button>
      </div>
      <div className="space-y-3">
        {history.map((entry) => (
          <div key={entry.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <p className="font-medium text-slate-900">
                {entry.filters.mediaType !== 'all' ? entry.filters.mediaType : 'All types'}
                {' · '}
                {entry.filters.city}
                {entry.filters.budget !== 'all' && ` · ${entry.filters.budget}`}
              </p>
              <p className="text-sm text-slate-500">
                {entry.resultCount} results · {new Date(entry.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button type="button" onClick={() => navigate(browsePathFromFilters(entry.filters))}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              Re-run search
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
