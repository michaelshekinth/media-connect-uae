import { AnimatePresence, motion } from 'framer-motion'
import { Clock } from 'lucide-react'

interface UnderReviewModalProps {
  open: boolean
  title?: string
  message?: string
  buttonLabel?: string
  onContinue: () => void
}

export function UnderReviewModal({
  open,
  title = 'Under review',
  message = 'Your submission has been received and is being reviewed by our admin team. You will be notified once approved.',
  buttonLabel = 'Go to dashboard',
  onContinue,
}: UnderReviewModalProps) {
  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-7 w-7 text-amber-600" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{message}</p>
          <button
            type="button"
            onClick={onContinue}
            className="mt-6 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {buttonLabel}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
