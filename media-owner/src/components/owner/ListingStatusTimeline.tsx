import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import type { OwnerListing } from '@shared/types/owner'

export function ListingStatusTimeline({ listing }: { listing: OwnerListing }) {
  const steps = [
    { label: 'Submitted', done: !!listing.submittedAt, date: listing.submittedAt },
    { label: 'Under review', done: listing.status === 'pending_approval' || listing.status === 'approved' || listing.status === 'rejected', date: listing.submittedAt },
    { label: listing.status === 'rejected' ? 'Rejected' : 'Approved & live', done: listing.status === 'approved' || listing.status === 'rejected', date: listing.reviewedAt },
  ]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="font-semibold text-slate-900">Status timeline</h3>
      <div className="mt-4 space-y-4">
        {steps.map((s, i) => (
          <div key={i} className="flex items-start gap-3">
            {listing.status === 'rejected' && i === 2 ? (
              <XCircle className="mt-0.5 h-5 w-5 text-red-500" />
            ) : s.done ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
            ) : (
              <Clock className="mt-0.5 h-5 w-5 text-slate-300" />
            )}
            <div>
              <p className="font-medium text-slate-800">{s.label}</p>
              {s.date && <p className="text-xs text-slate-400">{new Date(s.date).toLocaleString()}</p>}
            </div>
          </div>
        ))}
        {listing.rejectionReason && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">Reason: {listing.rejectionReason}</p>
        )}
      </div>
    </div>
  )
}
