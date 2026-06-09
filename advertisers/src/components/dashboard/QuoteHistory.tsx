import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getQuotes, updateQuoteStatus } from '../../services/userStore'
import type { QuoteRequest, QuoteStatus } from '@shared/types/user'

const statusStyles: Record<QuoteStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  responded: 'bg-blue-100 text-blue-800',
  accepted: 'bg-teal-100 text-teal-800',
  declined: 'bg-red-100 text-red-800',
}

export function QuoteHistory() {
  const [filter, setFilter] = useState<QuoteStatus | 'all'>('all')
  const [quotes, setQuotes] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    const data = await getQuotes()
    setQuotes(data)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  const filtered = quotes.filter((q) => filter === 'all' || q.status === filter)

  const handleAccept = async (q: QuoteRequest) => {
    await updateQuoteStatus(q.id, 'accepted')
    refresh()
  }

  const handleDecline = async (q: QuoteRequest) => {
    await updateQuoteStatus(q.id, 'declined')
    refresh()
  }

  if (loading) {
    return <div className="py-12 text-center text-slate-500">Loading quotes…</div>
  }

  if (quotes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center">
        <p className="text-slate-600">No quotes yet.</p>
        <Link to="/browse" className="mt-3 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-800">
          Browse media placements
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {(['all', 'pending', 'responded', 'accepted', 'declined'] as const).map((s) => (
          <button key={s} type="button" onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${filter === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {s}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map((q) => (
          <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{q.campaignName}</p>
                <Link to={`/agency/${q.agencyId}`} className="text-sm text-indigo-600 hover:underline">{q.agencyName}</Link>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${statusStyles[q.status]}`}>{q.status}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{q.mediaType} · {q.budgetRange}</p>
            {q.quotedAmount && (
              <p className="mt-1 text-sm font-semibold text-teal-700">Quoted: {q.quotedAmount.toLocaleString()} AED</p>
            )}
            {q.quotedDescription && (
              <p className="mt-1 text-sm text-slate-500">{q.quotedDescription}</p>
            )}
            <p className="mt-1 text-xs text-slate-400">{new Date(q.createdAt).toLocaleDateString()}</p>
            {q.status === 'responded' && (
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => handleAccept(q)}
                  className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700">Accept</button>
                <button type="button" onClick={() => handleDecline(q)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Decline</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
