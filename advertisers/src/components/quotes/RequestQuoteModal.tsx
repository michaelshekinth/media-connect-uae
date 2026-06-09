import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useState } from 'react'
import { DocumentUpload } from '../ui/DocumentUpload'
import { BUDGET_OPTIONS, MEDIA_TYPES } from '@shared/constants'
import { addQuote } from '../../services/userStore'
import type { Listing } from '@shared/types'
import type { MediaType } from '@shared/types'
import type { UploadedDocument } from '@shared/types/owner'

interface RequestQuoteModalProps {
  agencyId?: string
  agencyName?: string
  listing?: Listing
  onClose: () => void
  onSuccess: (agencyName: string) => void
}

export function RequestQuoteModal({
  agencyId,
  agencyName,
  listing,
  onClose,
  onSuccess,
}: RequestQuoteModalProps) {
  const resolvedAgencyId = agencyId ?? listing?.agencyId ?? ''
  const resolvedAgencyName = agencyName ?? listing?.agencyName ?? 'Agency'

  const [campaignName, setCampaignName] = useState('')
  const [mediaType, setMediaType] = useState<MediaType>(listing?.mediaType ?? 'OOH')
  const [budgetRange, setBudgetRange] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [message, setMessage] = useState('')
  const [briefAttachment, setBriefAttachment] = useState<UploadedDocument | null>(null)

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!campaignName || !startDate || !endDate) return

    const budgetLabel = BUDGET_OPTIONS.find((b) => b.value === budgetRange)?.label ?? budgetRange

    setSubmitting(true)
    try {
      await addQuote({
        agencyId: resolvedAgencyId,
        agencyName: resolvedAgencyName,
        listingId: listing?.id,
        campaignName,
        mediaType,
        budgetRange: budgetLabel,
        startDate,
        endDate,
        message: [
          message || 'No additional notes.',
          briefAttachment ? `\n[Attached brief: ${briefAttachment.fileName}]` : '',
        ].join('').trim(),
      })
      onSuccess(resolvedAgencyName)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Request quote</h2>
            <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="mb-4 text-sm text-slate-600">
            Send a campaign brief to <strong>{resolvedAgencyName}</strong>. Include goals, audience, and creative requirements.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Campaign name</label>
              <input required value={campaignName} onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Summer brand awareness 2026"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Media type</label>
                <select value={mediaType} onChange={(e) => setMediaType(e.target.value as MediaType)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm">
                  {MEDIA_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Budget range</label>
                <select value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm">
                  {BUDGET_OPTIONS.filter((b) => b.value !== 'all').map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Start date</label>
                <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">End date</label>
                <input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Campaign brief</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
                placeholder="Target audience, key messages, creative specs, KPIs..."
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <DocumentUpload
              label="Attach campaign brief"
              hint="Optional PDF or deck with campaign details"
              accept=".pdf,image/*"
              documentType="campaign_brief"
              value={briefAttachment}
              onChange={setBriefAttachment}
              variant="compact"
            />
            <button type="submit" disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60">
              {submitting ? 'Sending…' : 'Send quote request'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
