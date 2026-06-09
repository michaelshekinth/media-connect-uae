import { AnimatePresence, motion } from 'framer-motion'
import { DollarSign, Send, Shield, X } from 'lucide-react'
import { useState } from 'react'
import { DocumentUpload } from '../ui/DocumentUpload'
import { addCustomQuote } from '../../services/ownerStore'
import { maskContactInfo } from '@shared/utils/maskContactInfo'
import type { InboundLead, UploadedDocument } from '@shared/types/owner'

interface SendCustomQuoteModalProps {
  lead: InboundLead
  agencyId: string
  threadId: string
  onClose: () => void
  onSuccess: () => void
}

export function SendCustomQuoteModal({ lead, agencyId, threadId, onClose, onSuccess }: SendCustomQuoteModalProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [attachment, setAttachment] = useState<UploadedDocument | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amountAed = Number(amount)
    if (!amountAed || !description) return

    setSubmitting(true)
    try {
      const masked = maskContactInfo(description)
      await addCustomQuote(agencyId, {
        id: `${Date.now()}_cq`,
        quoteRequestId: lead.quoteRequestId,
        threadId,
        agencyId,
        advertiserId: lead.advertiserId,
        advertiserName: lead.advertiserName,
        amountAed,
        description: masked,
        attachmentName: attachment?.fileName,
        attachmentData: attachment?.data,
        status: 'sent',
        createdAt: new Date().toISOString(),
      })
      onSuccess()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <DollarSign className="h-5 w-5 text-amber-500" /> Send Custom Quote
            </h2>
            <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Quote Amount (AED)</label>
              <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Description / Terms</label>
              <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
                placeholder="e.g. 3-month flight, design included, 10% early-bird discount..."
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
            </div>
            <DocumentUpload
              label="Attach proposal / rate card"
              hint="PDF proposal or rate card for the advertiser"
              accept=".pdf,image/*"
              documentType="proposal"
              value={attachment}
              onChange={setAttachment}
              variant="compact"
            />
            <button type="submit" disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-sm font-bold text-slate-900 hover:bg-amber-500 disabled:opacity-60">
              <Send className="h-4 w-4" /> {submitting ? 'Sending…' : 'Send Quote'}
            </button>
          </form>

          <p className="mt-4 flex items-center justify-center gap-1 text-center text-xs text-slate-400">
            <Shield className="h-3.5 w-3.5" /> Any contact details in the description are masked automatically.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
