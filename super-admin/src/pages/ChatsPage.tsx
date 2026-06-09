import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllChatThreads } from '../services/adminService'
import { DataTable, PageHeader } from '../components/ui'

export function ChatsPage() {
  const [threads, setThreads] = useState<Awaited<ReturnType<typeof getAllChatThreads>>>([])
  useEffect(() => { getAllChatThreads().then(setThreads) }, [])

  return (
    <div>
      <PageHeader title="Chats" subtitle="Monitor advertiser ↔ media owner conversations (contacts masked)" />
      <DataTable
        headers={['Advertiser', 'Media Owner', 'Last message', 'Messages', 'Updated', 'Actions']}
        rows={threads.map((t) => [
          t.advertiserName,
          t.ownerName,
          <span key="m" className="line-clamp-1 max-w-xs">{t.lastMessage}</span>,
          t.messages.length,
          new Date(t.updatedAt).toLocaleDateString(),
          <Link key="v" to={`/chats/${encodeURIComponent(t.threadId)}`} className="text-amber-400 hover:underline">View</Link>,
        ])}
      />
    </div>
  )
}
