import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminDashboardStats } from '../services/adminService'
import { PageHeader, StatCard } from '../components/ui'

export function DashboardPage() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getAdminDashboardStats>> | null>(null)

  useEffect(() => {
    getAdminDashboardStats().then(setStats).catch(() => setStats(null))
  }, [])

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Platform overview and pending actions" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending Profiles" value={stats?.pendingProfiles ?? '—'} hint="Awaiting approval" />
        <StatCard label="Pending Listings" value={stats?.pendingListings ?? '—'} />
        <StatCard label="Advertisers" value={stats?.totalAdvertisers ?? '—'} />
        <StatCard label="Approved Media Owners" value={stats?.approvedOwners ?? '—'} />
        <StatCard label="Total RFQs" value={stats?.totalRFQs ?? '—'} />
        <StatCard label="Active Chats" value={stats?.totalChats ?? '—'} />
        <StatCard label="Media Owners" value={stats?.totalMediaOwners ?? '—'} />
        <StatCard label="Total Users" value={stats?.totalUsers ?? '—'} />
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/approvals" className="rounded-lg bg-amber-500/20 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-500/30">Review pending approvals</Link>
        <Link to="/rfq" className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">View RFQs</Link>
        <Link to="/chats" className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Monitor chats</Link>
      </div>
    </div>
  )
}
