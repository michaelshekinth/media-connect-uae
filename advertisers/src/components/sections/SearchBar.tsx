import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  Filter,
  MapPin,
  MonitorPlay,
  Search,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setPendingRedirectPath } from '../auth/ProtectedRoute'
import { BUDGET_OPTIONS, CITIES, MEDIA_CATEGORIES, MEDIA_CATEGORY_LABELS } from '@shared/constants'
import { useAuth } from '../../context/AuthContext'
import { addSearchHistory } from '../../services/userStore'
import { browsePathFromFilters } from '@shared/utils/searchParams'
import type { MediaType, SearchFilters } from '@shared/types'

const SEARCH_HERO_IMAGE =
  'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=900&h=1100&fit=crop&q=80'

interface SearchBarProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onSearch: (resultCount: number) => void
  resultCount: number
  totalListings: number
  hasSearched: boolean
  heroImage?: string
}

interface FilterFieldProps {
  icon: React.ReactNode
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}

function FilterField({
  icon,
  label,
  value,
  onChange,
  options,
}: FilterFieldProps) {
  return (
    <div className="search-filter-field group relative flex flex-1 flex-col px-4 py-3 sm:px-5 sm:py-4">
      <div className="mb-1 flex items-center gap-1.5">
        <span>{icon}</span>
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase sm:text-[11px]">
          {label}
        </span>
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full cursor-pointer appearance-none bg-transparent pr-7 text-sm font-semibold text-slate-900 transition-colors focus:outline-none sm:text-base"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-0 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-hover:text-indigo-500" />
      </div>
    </div>
  )
}

export function SearchBar({
  filters,
  onFiltersChange,
  onSearch,
  resultCount,
  totalListings,
  hasSearched,
  heroImage,
}: SearchBarProps) {
  const panelImage = heroImage || SEARCH_HERO_IMAGE
  const placementLabel =
    totalListings === 1 ? '1 placement' : `${totalListings} placements`
  const [showMore, setShowMore] = useState(false)
  const { user, openAuth } = useAuth()
  const navigate = useNavigate()

  const update = (partial: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...partial })
  }

  const handleSearch = () => {
    if (!user) {
      setPendingRedirectPath(browsePathFromFilters(filters))
      openAuth('login')
      return
    }

    confetti({
      particleCount: 60,
      spread: 55,
      origin: { y: 0.65 },
      colors: ['#4f46e5', '#7c3aed', '#f97316', '#fb923c'],
      ticks: 120,
      gravity: 1.1,
      scalar: 0.9,
    })

    onSearch(resultCount)
    addSearchHistory(filters, resultCount)
    navigate(browsePathFromFilters(filters))
  }

  const mediaOptions = [
    { value: 'all', label: 'All media types' },
    ...MEDIA_CATEGORIES.map((t) => ({ value: t, label: MEDIA_CATEGORY_LABELS[t] })),
  ]

  const cityOptions = CITIES.map((c) => ({ value: c, label: c }))

  return (
    <section id="search" className="relative -mt-24 px-4 sm:-mt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="search-panel overflow-hidden rounded-3xl border border-white/60 shadow-2xl shadow-indigo-900/20"
        >
          <div className="grid lg:grid-cols-12">
            {/* Visual panel */}
            <div className="relative hidden min-h-[320px] lg:col-span-5 lg:block">
              <img
                src={panelImage}
                alt="UAE media placements"
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/95 via-indigo-900/50 to-violet-800/30" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-indigo-950/40" />

              <div className="relative flex h-full flex-col justify-between p-8">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/40 bg-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-200 backdrop-blur-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    Premium inventory
                  </span>
                  <h3 className="mt-5 text-2xl leading-snug font-bold text-white">
                    Your next campaign starts here
                  </h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
                    From Sheikh Zayed Road billboards to mall DOOH screens — find
                    the right placement in minutes.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: String(totalListings), label: 'Placements' },
                    { value: '7', label: 'Emirates' },
                    { value: '48h', label: 'Quote time' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-center backdrop-blur-md"
                    >
                      <p className="text-lg font-extrabold text-orange-300">
                        {stat.value}
                      </p>
                      <p className="text-[10px] font-medium tracking-wide text-white/60 uppercase">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form panel */}
            <div className="lg:col-span-7">
              <div className="search-panel-header px-6 py-5 sm:px-8 sm:py-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold tracking-widest text-indigo-300 uppercase">
                      Smart search
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                      Find media that fits your brand
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
                    <Zap className="h-3.5 w-3.5 text-orange-300" />
                    Instant filtering
                  </div>
                </div>
              </div>

              <div className="bg-white px-5 py-6 sm:px-8 sm:py-7">
                {/* Mobile image strip */}
                <div className="relative mb-5 h-36 overflow-hidden rounded-2xl lg:hidden">
                  <img
                    src={panelImage}
                    alt="UAE media placements"
                    className="h-full w-full object-cover transition-opacity duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/80 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <p className="text-sm font-bold text-white">{placementLabel}</p>
                    <p className="text-xs text-white/70">Across 7 emirates</p>
                  </div>
                </div>

                {/* Unified search bar */}
                <div className="search-unified-bar flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/80 shadow-inner sm:flex-row sm:items-stretch">
                  <FilterField
                    icon={<MonitorPlay className="h-3.5 w-3.5 text-indigo-500" />}
                    label="Media Type"
                    value={filters.mediaType}
                    onChange={(v) =>
                      update({ mediaType: v as MediaType | 'all' })
                    }
                    options={mediaOptions}
                  />
                  <div className="hidden w-px self-stretch bg-slate-200 sm:block" />
                  <div className="h-px w-full bg-slate-200 sm:hidden" />
                  <FilterField
                    icon={<MapPin className="h-3.5 w-3.5 text-orange-500" />}
                    label="City"
                    value={filters.city}
                    onChange={(v) =>
                      update({ city: v as SearchFilters['city'] })
                    }
                    options={cityOptions}
                  />
                  <div className="hidden w-px self-stretch bg-slate-200 sm:block" />
                  <div className="h-px w-full bg-slate-200 sm:hidden" />
                  <FilterField
                    icon={<Wallet className="h-3.5 w-3.5 text-violet-500" />}
                    label="Budget (AED)"
                    value={filters.budget}
                    onChange={(v) =>
                      update({ budget: v as SearchFilters['budget'] })
                    }
                    options={BUDGET_OPTIONS}
                  />
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setShowMore(!showMore)}
                    className="flex items-center gap-2 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-800"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                      <Filter className="h-4 w-4" />
                    </span>
                    Advanced filters
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${showMore ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={handleSearch}
                    className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 px-8 py-4 text-base font-bold text-white shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/40 active:scale-[0.98] sm:w-auto"
                  >
                    <Search className="h-5 w-5 transition-transform group-hover:scale-110" />
                    Search placements
                  </button>
                </div>

                <AnimatePresence>
                  {showMore && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 grid gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-violet-50/50 p-5 sm:grid-cols-3">
                        <div>
                          <label className="mb-2 block text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                            Availability
                          </label>
                          <select
                            value={filters.availability}
                            onChange={(e) =>
                              update({
                                availability: e.target
                                  .value as SearchFilters['availability'],
                              })
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                          >
                            <option value="all">Any availability</option>
                            <option value="immediate">Immediate</option>
                            <option value="1-2-weeks">1–2 weeks</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                            Format
                          </label>
                          <select
                            value={filters.format}
                            onChange={(e) =>
                              update({
                                format: e.target.value as SearchFilters['format'],
                              })
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                          >
                            <option value="all">Any format</option>
                            <option value="billboard">Billboard</option>
                            <option value="mall">Mall</option>
                            <option value="transit">Transit</option>
                            <option value="social">Social</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <label className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <input
                              type="checkbox"
                              checked={filters.rating4Plus}
                              onChange={(e) =>
                                update({ rating4Plus: e.target.checked })
                              }
                              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-semibold text-slate-700">
                              Rating 4+ only
                            </span>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {hasSearched && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-5 flex justify-center"
                  >
                    <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-2 text-sm font-bold text-orange-700 shadow-sm">
                      <Sparkles className="h-4 w-4" />
                      {resultCount} placement{resultCount !== 1 ? 's' : ''} match
                      your search
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
