import { useEffect, useState } from 'react'
import { getAllRFQs } from '../services/adminService'
import { DataTable, PageHeader, StatusBadge } from '../components/ui'

export function RfqPage() {
  const [rfqs, setRfqs] = useState<Awaited<ReturnType<typeof getAllRFQs>>>([])
  useEffect(() => { getAllRFQs().then(setRfqs) }, [])

  return (
    <div>
      <PageHeader title="RFQ Management" subtitle="All quote requests from advertisers to media owners" />
      <DataTable
        headers={['Campaign', 'Advertiser', 'Media Owner', 'Type', 'Budget', 'Dates', 'Status']}
        rows={rfqs.map((r) => [
          r.campaignName,
          r.advertiserName,
          r.ownerName,
          r.mediaType,
          r.budgetRange,
          `${r.startDate} – ${r.endDate}`,
          <StatusBadge key="s" status={r.status} />,
        ])}
      />
    </div>
  )
}
