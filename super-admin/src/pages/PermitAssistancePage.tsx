import { useEffect, useState } from 'react'
import { getPermitAssistanceRequests } from '../services/adminService'
import { DataTable, PageHeader, StatusBadge } from '../components/ui'

export function PermitAssistancePage() {
  const [requests, setRequests] = useState<Awaited<ReturnType<typeof getPermitAssistanceRequests>>>([])

  useEffect(() => { getPermitAssistanceRequests().then(setRequests) }, [])

  return (
    <div>
      <PageHeader title="Permit Assistance" subtitle="Quote requests flagged for permit support" />
      <DataTable
        headers={['Campaign', 'Advertiser', 'Email', 'Publisher ID', 'Status', 'Requested']}
        rows={requests.map((r) => [
          r.campaignName,
          r.advertiserName,
          r.advertiserEmail,
          r.agencyId,
          <StatusBadge key="s" status={r.status} />,
          new Date(r.createdAt).toLocaleDateString(),
        ])}
      />
    </div>
  )
}
