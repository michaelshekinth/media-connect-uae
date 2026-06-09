import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getMediaOwnerDetail } from '../services/adminService'
import { Card, PageHeader, StatusBadge } from '../components/ui'

export function MediaOwnerDetailPage() {
  const { agencyId } = useParams<{ agencyId: string }>()
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof getMediaOwnerDetail>> | null>(null)

  useEffect(() => {
    if (agencyId) getMediaOwnerDetail(agencyId).then(setDetail)
  }, [agencyId])

  if (!detail) return <p className="text-slate-400">Loading...</p>
  const { user, data } = detail
  const p = data.companyProfile

  return (
    <div>
      <PageHeader title={user.companyName || p?.companyLegalName || 'Media Owner'}
        action={<Link to="/media-owners" className="text-sm text-slate-400">← Back</Link>} />
      <div className="mb-4"><StatusBadge status={user.ownerApprovalStatus ?? 'draft'} /></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold text-white">Company profile</h3>
          {p ? (
            <dl className="space-y-2 text-sm text-slate-300">
              <div><dt className="text-slate-500">Legal name</dt><dd>{p.companyLegalName}</dd></div>
              <div><dt className="text-slate-500">Authorized</dt><dd>{p.authorizedPerson}</dd></div>
              <div><dt className="text-slate-500">Phone</dt><dd>{p.phone}</dd></div>
              <div><dt className="text-slate-500">License</dt><dd>{p.licenseNumber} (exp {p.licenseExpiry})</dd></div>
              <div><dt className="text-slate-500">Categories</dt><dd>{p.mediaCategories.join(', ')}</dd></div>
              <div><dt className="text-slate-500">Documents</dt><dd>{p.documents.map((d) => d.label).join(', ') || 'None'}</dd></div>
            </dl>
          ) : <p className="text-slate-500">No profile saved</p>}
        </Card>
        <Card>
          <h3 className="mb-3 font-semibold text-white">Listings ({data.listings.length})</h3>
          <ul className="space-y-2 text-sm">
            {data.listings.map((l) => (
              <li key={l.id} className="flex justify-between text-slate-300">
                <span>{l.title}</span>
                <StatusBadge status={l.status} />
              </li>
            ))}
          </ul>
          <h3 className="mb-2 mt-6 font-semibold text-white">Leads / RFQs ({data.leads.length})</h3>
          <p className="text-sm text-slate-400">{data.leads.length} inbound requests</p>
        </Card>
      </div>
    </div>
  )
}
