import { useEffect, useState } from 'react'
import { getAdminDashboardStats, getAllListings, getAllRFQs, getAuditLog, getRevenueEntries, markRevenueCollected } from '../services/adminService'
import { Card, DataTable, PageHeader, StatCard, StatusBadge } from '../components/ui'

export function ReportsPage() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getAdminDashboardStats>> | null>(null)
  const [listingCount, setListingCount] = useState(0)
  const [rfqCount, setRfqCount] = useState(0)
  const [audit, setAudit] = useState<Awaited<ReturnType<typeof getAuditLog>>>([])
  const [revenue, setRevenue] = useState<Awaited<ReturnType<typeof getRevenueEntries>>>([])
  const [revenueFilter, setRevenueFilter] = useState<'all' | 'pending' | 'collected'>('all')

  const loadRevenue = () => {
    getRevenueEntries(revenueFilter === 'all' ? undefined : { status: revenueFilter }).then(setRevenue)
  }

  useEffect(() => {
    getAdminDashboardStats().then(setStats)
    getAllListings().then((l) => setListingCount(l.length))
    getAllRFQs().then((r) => setRfqCount(r.length))
    getAuditLog().then(setAudit)
  }, [])

  useEffect(() => { loadRevenue() }, [revenueFilter])

  const totalPending = revenue.filter((r) => r.status === 'pending').reduce((s, r) => s + r.amount, 0)
  const totalCollected = revenue.filter((r) => r.status === 'collected').reduce((s, r) => s + r.amount, 0)

  const handleMarkCollected = async (id: string) => {
    await markRevenueCollected(id)
    loadRevenue()
  }

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
      <PageHeader title="Reports" subtitle="Platform metrics, revenue, and audit trail"
        action={<button type="button" onClick={exportCsv} className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300">Export CSV</button>} />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total listings" value={listingCount} />
        <StatCard label="Total RFQs" value={rfqCount} />
        <StatCard label="Pending approvals" value={(stats?.pendingProfiles ?? 0) + (stats?.pendingListings ?? 0)} />
      </div>

      <Card className="mb-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-white">Revenue</h3>
          <div className="flex gap-2">
            {(['all', 'pending', 'collected'] as const).map((f) => (
              <button key={f} type="button" onClick={() => setRevenueFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-sm capitalize ${revenueFilter === f ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <StatCard label="Pending revenue (AED)" value={totalPending.toLocaleString()} />
          <StatCard label="Collected revenue (AED)" value={totalCollected.toLocaleString()} />
        </div>
        <DataTable
          headers={['Publisher ID', 'Type', 'Amount', 'Status', 'Created', 'Actions']}
          rows={revenue.map((r) => [
            r.agencyId,
            r.modelType.replace('_', ' '),
            `${r.amount.toLocaleString()} AED`,
            <StatusBadge key="s" status={r.status} />,
            r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—',
            r.status === 'pending' ? (
              <button key="a" type="button" onClick={() => handleMarkCollected(r.id)}
                className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">Mark collected</button>
            ) : '—',
          ])}
        />
      </Card>

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
