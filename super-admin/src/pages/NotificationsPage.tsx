import { useState } from 'react'
import { sendBroadcastNotification } from '../services/adminService'
import { Card, PageHeader } from '../components/ui'

export function NotificationsPage() {
  const [target, setTarget] = useState<'all' | 'advertisers' | 'owners'>('all')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [link, setLink] = useState('')
  const [sent, setSent] = useState(false)

  const send = async () => {
    if (!title.trim()) return
    await sendBroadcastNotification(target, title, body, link || undefined)
    setSent(true)
    setTitle('')
    setBody('')
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div>
      <PageHeader title="Send Notification" subtitle="Broadcast to advertisers, media owners, or everyone" />
      <Card className="max-w-xl">
        <label className="text-sm text-slate-400">Target</label>
        <select value={target} onChange={(e) => setTarget(e.target.value as typeof target)}
          className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white">
          <option value="all">All users</option>
          <option value="advertisers">Advertisers only</option>
          <option value="owners">Media owners only</option>
        </select>
        <label className="mt-4 block text-sm text-slate-400">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white" />
        <label className="mt-4 block text-sm text-slate-400">Message</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4}
          className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white" />
        <label className="mt-4 block text-sm text-slate-400">Deep link (optional)</label>
        <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="/dashboard"
          className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white" />
        <button type="button" onClick={send} className="mt-6 rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-semibold text-slate-900">Send notification</button>
        {sent && <p className="mt-3 text-sm text-emerald-400">Notification sent successfully.</p>}
      </Card>
    </div>
  )
}
