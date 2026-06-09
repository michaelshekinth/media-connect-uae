import { useEffect, useState } from 'react'
import { getActivities } from '../../services/userStore'
import type { ActivityEvent } from '@shared/types/user'

const typeColors: Record<string, string> = {
  quote_sent: 'bg-indigo-100 text-indigo-700',
  quote_responded: 'bg-teal-100 text-teal-700',
  listing_saved: 'bg-pink-100 text-pink-700',
  agency_saved: 'bg-pink-100 text-pink-700',
  search: 'bg-violet-100 text-violet-700',
  profile_updated: 'bg-slate-100 text-slate-700',
  login: 'bg-orange-100 text-orange-700',
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityEvent[]>([])

  useEffect(() => {
    getActivities().then(setActivities).catch(() => setActivities([]))
  }, [])

  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center">
        <p className="text-slate-600">No activity yet. Browse media or request a quote to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((a) => (
        <div key={a.id} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <span className={`shrink-0 rounded-lg px-2 py-1 text-xs font-bold uppercase ${typeColors[a.type] ?? 'bg-slate-100'}`}>
            {a.type.replace('_', ' ')}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900">{a.title}</p>
            <p className="text-sm text-slate-600">{a.description}</p>
            <p className="mt-1 text-xs text-slate-400">{new Date(a.createdAt).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
