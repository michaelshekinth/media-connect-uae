import { motion } from 'framer-motion'
import { Clock, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatBudgetRange } from '@shared/hooks/useSearchFilters'
import type { Listing } from '@shared/types'

interface RecentListingsProps {
  listings: Listing[]
  hasSearched: boolean
  loading?: boolean
}

const mediaTypeColors: Record<string, string> = {
  OOH: 'bg-indigo-100 text-indigo-700',
  DOOH: 'bg-violet-100 text-violet-700',
  TC: 'bg-blue-100 text-blue-700',
  'Radio & Print': 'bg-emerald-100 text-emerald-700',
  Influencers: 'bg-orange-100 text-orange-700',
}

export function RecentListings({ listings, hasSearched, loading = false }: RecentListingsProps) {
  return (
    <section id="listings" className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {hasSearched ? 'Search Results' : 'Recent Listings'}
            </h2>
            <p className="mt-2 text-slate-500">
              {hasSearched
                ? 'Placements matching your filters'
                : 'Latest media opportunities from verified owners'}
            </p>
          </div>
          <span className="text-sm font-medium text-slate-400">{listings.length} shown</span>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
            <p className="text-lg font-semibold text-slate-700">Loading placements…</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <p className="text-lg font-semibold text-slate-700">No placements match your filters</p>
            <p className="mt-2 text-sm text-slate-500">
              Try adjusting your media type, city, or budget range
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing, i) => (
              <Link
                key={listing.id}
                to={`/listing/${listing.id}`}
                className="block text-inherit no-underline"
              >
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <span
                      className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold ${mediaTypeColors[listing.mediaType]}`}
                    >
                      {listing.mediaType}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="line-clamp-2 text-base font-bold text-slate-900">{listing.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{listing.agencyName}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-orange-500" />
                        {listing.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {listing.rating}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-sm font-bold text-indigo-700">
                        {formatBudgetRange(listing.budgetMin, listing.budgetMax)}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <Clock className="h-3.5 w-3.5" />
                        Quote in 48h
                      </span>
                    </div>
                  </div>
                </motion.article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
