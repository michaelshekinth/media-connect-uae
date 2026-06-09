import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ToastProps {
  message: string
  visible: boolean
  onClose: () => void
}

export function Toast({ message, visible, onClose }: ToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 left-1/2 z-[100] flex max-w-md -translate-x-1/2 items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-xl"
        >
          <p className="flex-1 text-sm text-slate-700">{message}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
