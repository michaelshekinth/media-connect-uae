import type { OwnerStats } from '@shared/types/owner'

interface OverviewChartsProps {
  stats: OwnerStats
  days: number
  onDaysChange: (d: number) => void
}

export function OverviewCharts({ stats, days, onDaysChange }: OverviewChartsProps) {
  const maxLeads = Math.max(...stats.leadsByDay.map((d) => d.count), 1)

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {[7, 30, 90].map((d) => (
          <button key={d} type="button" onClick={() => onDaysChange(d)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${days === d ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {d} days
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-800">Leads over time</h3>
        <div className="mt-4 flex h-32 items-end gap-1">
          {stats.leadsByDay.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <div className="w-full rounded-t bg-slate-800 transition-all" style={{ height: `${(d.count / maxLeads) * 100}%`, minHeight: d.count ? 4 : 0 }} />
              <span className="text-[9px] text-slate-400">{d.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-800">Quotes sent vs deals won</h3>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-20 text-xs text-slate-500">Sent</span>
              <div className="h-3 flex-1 rounded-full bg-slate-100">
                <div className="h-3 rounded-full bg-amber-400" style={{ width: `${Math.min(stats.quotesByStatus.sent * 20, 100)}%` }} />
              </div>
              <span className="text-sm font-bold">{stats.quotesByStatus.sent}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-20 text-xs text-slate-500">Won</span>
              <div className="h-3 flex-1 rounded-full bg-slate-100">
                <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${Math.min(stats.quotesByStatus.accepted * 20, 100)}%` }} />
              </div>
              <span className="text-sm font-bold">{stats.quotesByStatus.accepted}</span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-800">Listings by status</h3>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-amber-50 p-3">
              <p className="text-2xl font-bold text-amber-700">{stats.listingsByStatus.pending}</p>
              <p className="text-xs text-amber-600">Pending</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-2xl font-bold text-emerald-700">{stats.listingsByStatus.approved}</p>
              <p className="text-xs text-emerald-600">Live</p>
            </div>
            <div className="rounded-xl bg-red-50 p-3">
              <p className="text-2xl font-bold text-red-700">{stats.listingsByStatus.rejected}</p>
              <p className="text-xs text-red-600">Rejected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
