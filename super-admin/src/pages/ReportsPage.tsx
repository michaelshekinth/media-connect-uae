import { useEffect, useState } from 'react'
import { getAdminDashboardStats, getAllListings, getAllRFQs, getAuditLog } from '../services/adminService'
import { Card, PageHeader, StatCard } from '../components/ui'

export function ReportsPage() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getAdminDashboardStats>> | null>(null)
  const [listingCount, setListingCount] = useState(0)
  const [rfqCount, setRfqCount] = useState(0)
  const [audit, setAudit] = useState<Awaited<ReturnType<typeof getAuditLog>>>([])

  useEffect(() => {
    getAdminDashboardStats().then(setStats)
    getAllListings().then((l) => setListingCount(l.length))
    getAllRFQs().then((r) => setRfqCount(r.length))
    getAuditLog().then(setAudit)
  }, [])

  const exportCsv = () => {
    const rows = [['Metric', 'Value'], ['RFQs', String(rfqCount)], ['Listings', String(listingCount)], ['Pending profiles', String(stats?.pendingProfiles ?? 0)]]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'mediaconnect-report.csv'
    a.click()
  }

  return (
    <div>
      <PageHeader title="Reports" subtitle="Platform metrics and audit trail"
        action={<button type="button" onClick={exportCsv} className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300">Export CSV</button>} />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total listings" value={listingCount} />
        <StatCard label="Total RFQs" value={rfqCount} />
        <StatCard label="Pending approvals" value={(stats?.pendingProfiles ?? 0) + (stats?.pendingListings ?? 0)} />
      </div>
      <Card>
        <h3 className="mb-4 font-semibold text-white">Recent admin actions</h3>
        <ul className="max-h-80 space-y-2 overflow-y-auto text-sm text-slate-400">
          {audit.length === 0 ? <li>No audit entries yet</li> : audit.map((a) => (
            <li key={a.id}>{new Date(a.createdAt).toLocaleString()} — {a.adminEmail} {a.action}d {a.entity} {a.entityId} {a.detail ? `(${a.detail})` : ''}</li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
