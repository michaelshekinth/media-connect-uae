import { useEffect, useState } from 'react'
import { getChats, markThreadRead, sendChatMessage } from '../../services/userStore'
import type { ChatThread } from '@shared/types/user'

export function ChatsPanel() {
  const [chats, setChats] = useState<ChatThread[]>([])
  const [activeId, setActiveId] = useState('')
  const [draft, setDraft] = useState('')
  const [sendError, setSendError] = useState('')

  const refresh = async () => {
    const data = await getChats()
    setChats(data)
    if (!activeId && data[0]) setActiveId(data[0].id)
  }

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [])

  const active = chats.find((c) => c.id === activeId)

  const selectThread = async (id: string) => {
    setActiveId(id)
    await markThreadRead(id)
    refresh()
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim() || !activeId) return
    const result = await sendChatMessage(activeId, draft.trim())
    if (!result.ok) {
      setSendError(result.error)
      return
    }
    setSendError('')
    setDraft('')
    refresh()
  }

  if (chats.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center">
        <p className="text-slate-600">No chats yet. Request a quote to start a conversation.</p>
      </div>
    )
  }

  return (
    <div className="flex h-[480px] overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="w-64 shrink-0 overflow-y-auto border-r border-slate-200">
        {chats.map((c) => (
          <button key={c.id} type="button" onClick={() => selectThread(c.id)}
            className={`w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 ${activeId === c.id ? 'bg-indigo-50' : ''}`}>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white" style={{ backgroundColor: c.agencyColor }}>
                {c.agencyName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{c.agencyName}</p>
                <p className="truncate text-xs text-slate-500">{c.lastMessage}</p>
              </div>
              {c.unread && <span className="h-2 w-2 rounded-full bg-orange-500" />}
            </div>
          </button>
        ))}
      </div>
      <div className="flex flex-1 flex-col">
        {active ? (
          <>
            <div className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-900">{active.agencyName}</div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {active.messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                    {m.quoteCard ? (
                      <div>
                        <p className="font-bold text-indigo-700">{m.quoteCard.amount.toLocaleString()} AED</p>
                        <p className="mt-1">{m.quoteCard.description}</p>
                      </div>
                    ) : m.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="flex flex-col gap-2 border-t border-slate-200 p-4">
              {sendError && <p className="text-xs text-red-600">{sendError}</p>}
              <div className="flex gap-2">
              <input value={draft} onChange={(e) => { setDraft(e.target.value); setSendError('') }} placeholder="Type a message..."
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100" />
              <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Send</button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-slate-500">Select a conversation</div>
        )}
      </div>
    </div>
  )
}
