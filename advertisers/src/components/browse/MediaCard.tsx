import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatBudgetRange } from '@shared/hooks/useSearchFilters'
import { MEDIA_CATEGORY_COLORS, MEDIA_CATEGORY_LABELS } from '@shared/constants'
import { normalizeMediaType } from '@shared/types'
import { getToken } from '@shared/services/apiClient'
import { isFavoriteListing, toggleFavoriteListing } from '../../services/userStore'
import type { Listing } from '@shared/types'
import { useEffect, useState } from 'react'

const typeColors = Object.fromEntries(
  Object.entries(MEDIA_CATEGORY_COLORS).map(([key, val]) => [key, val.solid]),
) as Record<string, string>

interface MediaCardProps {
  listing: Listing
  onBook?: (listing: Listing) => void
}

export function MediaCard({ listing, onBook }: MediaCardProps) {
  const [saved, setSaved] = useState(false)
  const listingPath = `/listing/${listing.id}`

  useEffect(() => {
    if (!getToken('advertiser')) return
    isFavoriteListing(listing.id).then(setSaved).catch(() => setSaved(false))
  }, [listing.id])

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!getToken('advertiser')) return
    const next = await toggleFavoriteListing(listing.id)
    setSaved(next)
  }

  return (
    <Link
      to={listingPath}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative block h-48 overflow-hidden">
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span
          className={`absolute top-3 left-3 rounded-md px-2.5 py-1 text-xs font-bold text-white ${typeColors[normalizeMediaType(listing.mediaType)] ?? 'bg-slate-600'}`}
        >
          {MEDIA_CATEGORY_LABELS[normalizeMediaType(listing.mediaType)]}
        </span>
        {listing.isDirectMedia && (
          <span className="absolute top-3 right-12 rounded-md bg-pink-500 px-2.5 py-1 text-xs font-bold text-white">
            Direct Media
          </span>
        )}
        <button
          type="button"
          onClick={toggleSave}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm hover:bg-white"
          aria-label={saved ? 'Remove from favourites' : 'Save to favourites'}
        >
          <Heart className={`h-4 w-4 ${saved ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600">{listing.title}</h3>
        <p className="mt-1 text-sm text-slate-500">
          {listing.agencyName} · {listing.city}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-sm font-semibold text-indigo-600">
            {formatBudgetRange(listing.budgetMin, listing.budgetMax)}
          </span>
          {onBook && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onBook(listing)
              }}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Book
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}
