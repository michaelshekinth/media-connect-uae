import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllAdvertisers } from '../services/adminService'
import { DataTable, PageHeader, StatusBadge } from '../components/ui'

export function UsersPage() {
  const [users, setUsers] = useState<Awaited<ReturnType<typeof getAllAdvertisers>>>([])
  useEffect(() => { getAllAdvertisers().then(setUsers) }, [])

  return (
    <div>
      <PageHeader title="Advertisers" subtitle="Registered advertiser accounts" />
      <DataTable
        headers={['Name', 'Email', 'Company', 'City', 'Quotes', 'Subscription', 'Actions']}
        rows={users.map((u) => [
          u.fullName,
          u.email,
          u.companyName || '—',
          u.defaultCity,
          u.quotesCount,
          u.subscription ? <StatusBadge key="sub" status="active" /> : '—',
          <Link key="v" to={`/users/${u.id}`} className="text-amber-400 hover:underline">View</Link>,
        ])}
      />
    </div>
  )
}
