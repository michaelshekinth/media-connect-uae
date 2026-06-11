import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'
import { DocumentUpload } from '../ui/DocumentUpload'
import { BUDGET_OPTIONS, MEDIA_CATEGORIES, MEDIA_CATEGORY_LABELS, UAE_CITIES } from '@shared/constants'
import { CONTACT_BLOCKED_MESSAGE, containsContactInfo } from '@shared/utils/maskContactInfo'
import { addQuote } from '../../services/userStore'
import type { Listing } from '@shared/types'
import type { MediaType } from '@shared/types'
import type { UploadedDocument } from '@shared/types/owner'

const OBJECTIVE_OPTIONS = [
  'Brand awareness',
  'Product launch',
  'Lead generation',
  'Event promotion',
  'Seasonal campaign',
]

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
  type EmirateCity = (typeof UAE_CITIES)[number]
  const listingCity = listing?.city as string | undefined
  const defaultEmirate: EmirateCity =
    listingCity && listingCity !== 'All UAE' ? (listingCity as EmirateCity) : 'Dubai'
  const [emirate, setEmirate] = useState<EmirateCity>(defaultEmirate)
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([])
  const [permitAssistance, setPermitAssistance] = useState(false)
  const [message, setMessage] = useState('')
  const [briefAttachment, setBriefAttachment] = useState<UploadedDocument | null>(null)
  const [contactWarning, setContactWarning] = useState('')

  const [submitting, setSubmitting] = useState(false)

  const toggleObjective = (objective: string) => {
    setSelectedObjectives((prev) =>
      prev.includes(objective) ? prev.filter((o) => o !== objective) : [...prev, objective],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!campaignName || !startDate || !endDate) return
    if (containsContactInfo(message)) {
      setContactWarning(CONTACT_BLOCKED_MESSAGE)
      return
    }

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
          selectedObjectives.length ? `\nObjectives: ${selectedObjectives.join(', ')}` : '',
          `\nEmirate: ${emirate}`,
          permitAssistance ? '\nPermit assistance requested.' : '',
          briefAttachment ? `\n[Attached brief: ${briefAttachment.fileName}]` : '',
        ].join('').trim(),
        objectives: selectedObjectives.join(','),
        emirate,
        permitAssistance,
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

          <div className="mb-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{CONTACT_BLOCKED_MESSAGE}. Share details through the platform chat after connecting.</span>
          </div>

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
                  {MEDIA_CATEGORIES.map((t) => (
                    <option key={t} value={t}>{MEDIA_CATEGORY_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Emirate</label>
                <select
                  value={emirate}
                  onChange={(e) => setEmirate(e.target.value as EmirateCity)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm">
                  {UAE_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Campaign objectives</label>
              <div className="flex flex-wrap gap-2">
                {OBJECTIVE_OPTIONS.map((obj) => (
                  <button
                    key={obj}
                    type="button"
                    onClick={() => toggleObjective(obj)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      selectedObjectives.includes(obj)
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-300'
                    }`}
                  >
                    {obj}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Budget range</label>
                <select value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm">
                  {BUDGET_OPTIONS.filter((b) => b.value !== 'all').map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={permitAssistance}
                    onChange={(e) => setPermitAssistance(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Need permit assistance</span>
                </label>
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
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  setContactWarning('')
                }}
                rows={4}
                placeholder="Target audience, key messages, creative specs, KPIs..."
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              {contactWarning && (
                <p className="mt-1 text-xs font-medium text-red-600">{contactWarning}</p>
              )}
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
