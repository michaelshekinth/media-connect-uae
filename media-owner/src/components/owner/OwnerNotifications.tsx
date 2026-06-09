import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOwnerNotifications, markAllOwnerNotificationsRead, markOwnerNotificationRead } from '../../services/ownerStore'
import type { OwnerNotification } from '@shared/types/owner'

export function OwnerNotifications({ agencyId }: { agencyId: string }) {
  const [notifications, setNotifications] = useState<OwnerNotification[]>([])

  const refresh = async () => {
    const data = await getOwnerNotifications(agencyId)
    setNotifications(data)
  }

  useEffect(() => {
    refresh()
  }, [agencyId])

  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center">
        <p className="text-slate-600">No notifications yet.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={async () => { await markAllOwnerNotificationsRead(agencyId); refresh() }}
          className="text-sm font-medium text-slate-600 hover:text-slate-800">Mark all read</button>
      </div>
      <div className="space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className={`rounded-xl border p-4 ${n.read ? 'border-slate-200 bg-white' : 'border-amber-200 bg-amber-50/50'}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{n.title}</p>
                <p className="mt-1 text-sm text-slate-600">{n.body}</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.read && (
                <button type="button" onClick={async () => { await markOwnerNotificationRead(agencyId, n.id); refresh() }}
                  className="text-xs font-medium text-amber-700">Mark read</button>
              )}
            </div>
            {n.link && (
              <Link to={n.link} className="mt-2 inline-block text-sm font-medium text-slate-800 hover:underline">View</Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
