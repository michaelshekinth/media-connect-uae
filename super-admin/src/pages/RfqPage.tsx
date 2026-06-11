import { useEffect, useState } from 'react'
import { getAllRFQs } from '../services/adminService'
import { DataTable, PageHeader, StatusBadge } from '../components/ui'

export function RfqPage() {
  const [rfqs, setRfqs] = useState<Awaited<ReturnType<typeof getAllRFQs>>>([])
  useEffect(() => { getAllRFQs().then(setRfqs) }, [])

  return (
    <div>
      <PageHeader title="RFQ Management" subtitle="All quote requests from advertisers to publishers" />
      <DataTable
        headers={['Campaign', 'Advertiser', 'Publisher', 'Type', 'Budget', 'Dates', 'Status', 'Contact viewed']}
        rows={rfqs.map((r) => [
          r.campaignName,
          r.advertiserName,
          r.ownerName,
          r.mediaType,
          r.budgetRange,
          `${r.startDate} – ${r.endDate}`,
          <StatusBadge key="s" status={r.status} />,
          r.contactViewedAt ? (
            <span key="c" className="text-emerald-400" title={new Date(r.contactViewedAt).toLocaleString()}>Viewed</span>
          ) : (
            <span key="c" className="text-slate-500">Not viewed</span>
          ),
        ])}
      />
    </div>
  )
}
