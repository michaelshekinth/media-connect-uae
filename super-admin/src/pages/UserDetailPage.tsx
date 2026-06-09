import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAdvertiserDetail, updateAdvertiser } from '../services/adminService'
import { Card, PageHeader, StatusBadge } from '../components/ui'

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof getAdvertiserDetail>> | null>(null)
  const [form, setForm] = useState({ fullName: '', companyName: '', phone: '', defaultCity: '' })

  useEffect(() => {
    if (!id) return
    getAdvertiserDetail(id).then((d) => {
      setDetail(d)
      if (d?.user) setForm({
        fullName: d.user.fullName, companyName: d.user.companyName,
        phone: d.user.phone, defaultCity: d.user.defaultCity,
      })
    })
  }, [id])

  const save = async () => {
    if (!id) return
    await updateAdvertiser(id, form)
    getAdvertiserDetail(id).then(setDetail)
  }

  if (!detail?.user) return <p className="text-slate-400">User not found</p>

  return (
    <div>
      <PageHeader title={detail.user.fullName} subtitle={detail.user.email}
        action={<Link to="/users" className="text-sm text-slate-400 hover:text-white">← Back</Link>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold text-white">Profile</h3>
          {(['fullName', 'companyName', 'phone', 'defaultCity'] as const).map((f) => (
            <div key={f} className="mb-3">
              <label className="text-xs text-slate-500 capitalize">{f}</label>
              <input value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white" />
            </div>
          ))}
          <button type="button" onClick={save} className="mt-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900">Save</button>
        </Card>
        <Card>
          <h3 className="mb-4 font-semibold text-white">Subscription</h3>
          {detail.data.subscription ? (
            <div className="text-sm text-slate-300">
              <p>Package: {detail.data.subscription.packageName}</p>
              <p>Views left: {detail.data.subscription.contactViewsRemaining}</p>
              <p>Expires: {new Date(detail.data.subscription.expiresAt).toLocaleDateString()}</p>
            </div>
          ) : <p className="text-slate-500">No active subscription</p>}
          <h3 className="mb-2 mt-6 font-semibold text-white">Quotes ({detail.data.quotes.length})</h3>
          <ul className="max-h-48 space-y-2 overflow-y-auto text-sm text-slate-400">
            {detail.data.quotes.map((q) => (
              <li key={q.id}>{q.campaignName} — <StatusBadge status={q.status} /></li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
