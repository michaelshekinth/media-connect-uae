import { motion } from 'framer-motion'
import { MessageSquare, Search, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchPublicCms } from '@shared/services/publicApi'

const DEFAULT_STEPS = [
  {
    title: 'Browse',
    description: 'Explore verified publisher inventory across the UAE.',
    icon: Search,
  },
  {
    title: 'Request quote',
    description: 'Send your campaign brief to publishers.',
    icon: MessageSquare,
  },
  {
    title: 'Chat & close',
    description: 'Negotiate in-platform and launch your campaign.',
    icon: Sparkles,
  },
]

export function HowItWorks() {
  const [title, setTitle] = useState('How it works')
  const [steps, setSteps] = useState(DEFAULT_STEPS)

  useEffect(() => {
    let cancelled = false
    fetchPublicCms()
      .then((cms) => {
        if (cancelled) return
        if (cms.howItWorks?.title) setTitle(cms.howItWorks.title)
        if (cms.howItWorks?.steps?.length) {
          setSteps(
            cms.howItWorks.steps.map((step, i) => ({
              ...step,
              icon: DEFAULT_STEPS[i]?.icon ?? Sparkles,
            })),
          )
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-xs font-bold tracking-widest text-indigo-600 uppercase">
            Simple process
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-6 text-center"
            >
              <span className="absolute -top-3 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <step.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
