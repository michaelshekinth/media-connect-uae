import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { getAllChatThreads } from '../services/adminService'
import { PageHeader } from '../components/ui'

export function ChatsPage() {
  const [threads, setThreads] = useState<Awaited<ReturnType<typeof getAllChatThreads>>>([])
  const [expandedPublishers, setExpandedPublishers] = useState<Set<string>>(new Set())
  const [expandedAdvertisers, setExpandedAdvertisers] = useState<Set<string>>(new Set())

  useEffect(() => { getAllChatThreads().then(setThreads) }, [])

  const tree = useMemo(() => {
    const byPublisher = new Map<string, Map<string, typeof threads>>()
    for (const t of threads) {
      if (!byPublisher.has(t.ownerName)) byPublisher.set(t.ownerName, new Map())
      const byAdvertiser = byPublisher.get(t.ownerName)!
      if (!byAdvertiser.has(t.advertiserName)) byAdvertiser.set(t.advertiserName, [])
      byAdvertiser.get(t.advertiserName)!.push(t)
    }
    return byPublisher
  }, [threads])

  const togglePublisher = (name: string) => {
    setExpandedPublishers((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const toggleAdvertiser = (key: string) => {
    setExpandedAdvertisers((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div>
      <PageHeader title="Chats" subtitle="Monitor advertiser ↔ publisher conversations (contacts masked)" />
      {threads.length === 0 ? (
        <p className="text-slate-500">No chat threads yet.</p>
      ) : (
        <div className="space-y-2">
          {[...tree.entries()].map(([publisher, advertisers]) => {
            const pubOpen = expandedPublishers.has(publisher)
            const threadCount = [...advertisers.values()].reduce((n, arr) => n + arr.length, 0)
            return (
              <div key={publisher} className="rounded-xl border border-slate-700 bg-slate-800/50">
                <button type="button" onClick={() => togglePublisher(publisher)}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left font-semibold text-white hover:bg-slate-800">
                  {pubOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <span>{publisher}</span>
                  <span className="ml-auto text-xs font-normal text-slate-400">{threadCount} thread{threadCount !== 1 ? 's' : ''}</span>
                </button>
                {pubOpen && (
                  <div className="border-t border-slate-700 px-2 pb-2">
                    {[...advertisers.entries()].map(([advertiser, advThreads]) => {
                      const advKey = `${publisher}::${advertiser}`
                      const advOpen = expandedAdvertisers.has(advKey)
                      return (
                        <div key={advKey} className="ml-4 mt-1 rounded-lg border border-slate-700/80 bg-slate-900/40">
                          <button type="button" onClick={() => toggleAdvertiser(advKey)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-slate-200 hover:bg-slate-800/60">
                            {advOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                            <span>{advertiser}</span>
                            <span className="ml-auto text-xs text-slate-500">{advThreads.length}</span>
                          </button>
                          {advOpen && (
                            <ul className="border-t border-slate-700/80 px-3 py-2">
                              {advThreads.map((t) => (
                                <li key={t.threadId} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-slate-300">{t.lastMessage || 'No messages'}</p>
                                    <p className="text-xs text-slate-500">{t.messages.length} messages · {new Date(t.updatedAt).toLocaleDateString()}</p>
                                  </div>
                                  <Link to={`/chats/${encodeURIComponent(t.threadId)}`} className="shrink-0 text-amber-400 hover:underline">View</Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
