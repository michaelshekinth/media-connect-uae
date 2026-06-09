import { DollarSign, Paperclip, Send, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  getInboundLeads,
  getOwnerChats,
  markOwnerThreadRead,
  sendOwnerMessage,
} from '../../services/ownerStore'
import type { InboundLead, OwnerChatThread } from '@shared/types/owner'
import { SendCustomQuoteModal } from './SendCustomQuoteModal'

interface OwnerChatsPanelProps {
  agencyId: string
  initialThreadId?: string
}

export function OwnerChatsPanel({ agencyId, initialThreadId }: OwnerChatsPanelProps) {
  const [chats, setChats] = useState<OwnerChatThread[]>([])
  const [activeId, setActiveId] = useState(initialThreadId ?? '')
  const [draft, setDraft] = useState('')
  const [sendError, setSendError] = useState('')
  const [quoteLead, setQuoteLead] = useState<InboundLead | null>(null)
  const [leads, setLeads] = useState<InboundLead[]>([])

  const refresh = async () => {
    const [chatData, leadData] = await Promise.all([
      getOwnerChats(agencyId),
      getInboundLeads(agencyId),
    ])
    setChats(chatData)
    setLeads(leadData)
    if (!activeId && chatData[0]) setActiveId(chatData[0].id)
  }

  useEffect(() => {
    refresh()
  }, [agencyId])

  const active = chats.find((c) => c.id === activeId)

  const selectThread = async (id: string) => {
    setActiveId(id)
    await markOwnerThreadRead(agencyId, id)
    refresh()
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim() || !activeId || !active) return
    const result = await sendOwnerMessage(agencyId, activeId, draft.trim())
    if (!result.ok) {
      setSendError(result.error)
      return
    }
    setSendError('')
    setDraft('')
    refresh()
  }

  const openQuote = () => {
    if (!active) return
    const lead = leads.find((l) => l.advertiserId === active.advertiserId)
    if (lead) setQuoteLead(lead)
  }

  if (chats.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center">
        <p className="text-slate-600">No conversations yet. Leads from advertisers will appear here.</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="w-64 shrink-0 overflow-y-auto border-r border-slate-200">
          {chats.map((c) => (
            <button key={c.id} type="button" onClick={() => selectThread(c.id)}
              className={`w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 ${activeId === c.id ? 'bg-slate-50' : ''}`}>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-xs font-bold">{c.advertiserName.charAt(0)}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{c.advertiserName}</p>
                  <p className="truncate text-xs text-slate-500">{c.lastMessage}</p>
                </div>
                {c.unread && <span className="h-2 w-2 rounded-full bg-amber-500" />}
              </div>
            </button>
          ))}
        </div>
        <div className="flex flex-1 flex-col">
          {active ? (
            <>
              <div className="border-b border-slate-200 px-4 py-3 font-semibold">{active.advertiserName}</div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {active.messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === 'owner' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.sender === 'owner' ? 'bg-amber-100 text-slate-900' : 'bg-slate-100 text-slate-800'}`}>
                      {m.quoteCard ? (
                        <div>
                          <p className="font-bold text-amber-700">{m.quoteCard.amount.toLocaleString()} AED</p>
                          <p className="mt-1">{m.quoteCard.description}</p>
                        </div>
                      ) : m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 p-4">
                <p className="mb-2 flex items-center gap-1 text-xs text-slate-400">
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  Sharing emails, phone numbers or links isn&apos;t allowed — they&apos;re masked automatically.
                </p>
                <button type="button" onClick={openQuote}
                  className="mb-3 flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700">
                  <DollarSign className="h-4 w-4" /> Send custom quote <Paperclip className="h-3.5 w-3.5" />
                </button>
                {sendError && <p className="mb-2 text-xs text-red-600">{sendError}</p>}
                <form onSubmit={handleSend} className="flex gap-2">
                  <input value={draft} onChange={(e) => { setDraft(e.target.value); setSendError('') }} placeholder="Type a message..."
                    className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm focus:outline-none" />
                  <button type="submit" className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-slate-900 hover:bg-amber-500">
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-slate-500">Select a conversation</div>
          )}
        </div>
      </div>

      {quoteLead && active && (
        <SendCustomQuoteModal
          lead={quoteLead}
          agencyId={agencyId}
          threadId={active.id}
          onClose={() => setQuoteLead(null)}
          onSuccess={() => { setQuoteLead(null); refresh() }}
        />
      )}
    </>
  )
}
