import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAllChatThreads } from '../services/adminService'
import { Card, PageHeader } from '../components/ui'

export function ChatDetailPage() {
  const { threadId } = useParams<{ threadId: string }>()
  const [thread, setThread] = useState<Awaited<ReturnType<typeof getAllChatThreads>>[0] | null>(null)

  useEffect(() => {
    getAllChatThreads().then((threads) => {
      setThread(threads.find((t) => t.threadId === decodeURIComponent(threadId ?? '')) ?? null)
    })
  }, [threadId])

  if (!thread) return <p className="text-slate-400">Thread not found</p>

  return (
    <div>
      <PageHeader title={`${thread.advertiserName} ↔ ${thread.ownerName}`}
        subtitle="Read-only · contact info masked in messages"
        action={<Link to="/chats" className="text-sm text-slate-400">← Back</Link>} />
      <Card>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto">
          {thread.messages.map((m) => (
            <div key={m.createdAt + m.text} className={`rounded-lg px-4 py-2 text-sm ${m.sender === 'owner' ? 'ml-8 bg-slate-700' : 'mr-8 bg-slate-800'}`}>
              <p className="text-xs text-slate-500 capitalize">{m.sender} · {new Date(m.createdAt).toLocaleString()}</p>
              <p className="mt-1 text-slate-200">{m.text}</p>
              {m.quoteCard ? (
                <div className="mt-2 rounded border border-amber-500/30 bg-amber-500/10 p-2 text-amber-200">
                  Quote: {(m.quoteCard as { amount: number }).amount?.toLocaleString()} AED
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
