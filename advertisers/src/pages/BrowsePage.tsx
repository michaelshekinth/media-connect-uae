import { useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext, useSearchParams } from 'react-router-dom'
import { CategoryFilterBar } from '../components/browse/CategoryFilterBar'
import { MediaCard } from '../components/browse/MediaCard'
import { RequestQuoteModal } from '../components/quotes/RequestQuoteModal'
import { BUDGET_OPTIONS, CITIES } from '@shared/constants'
import { filterListings } from '@shared/hooks/useSearchFilters'
import { getAllListings } from '@shared/services/listingCatalog'
import { fetchAgency, getRecentlyViewed } from '../services/userStore'
import type { Listing } from '@shared/types'
import type { AgencyProfile, BrowseCategory } from '@shared/types/user'
import {
  categoryFromParams,
  searchParamsToFilters,
} from '@shared/utils/searchParams'

type OutletCtx = { showToast: (msg: string) => void }
type SortOption = 'price-asc' | 'rating' | 'newest'

export function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast } = useOutletContext<OutletCtx>()
  const [quoteListing, setQuoteListing] = useState<Listing | null>(null)
  const [sort, setSort] = useState<SortOption>('price-asc')
  const [allListings, setAllListings] = useState<Listing[]>([])
  const [recentAgencies, setRecentAgencies] = useState<AgencyProfile[]>([])

  useEffect(() => {
    let cancelled = false
    const load = async (attempt = 0) => {
      try {
        const data = await getAllListings()
        if (!cancelled) setAllListings(data)
      } catch {
        if (cancelled) return
        if (attempt < 6) {
          window.setTimeout(() => load(attempt + 1), 800)
        } else if (!cancelled) {
          setAllListings([])
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const ids = getRecentlyViewed()
    Promise.all(
      ids.map((id) =>
        fetchAgency(id).then((a) => a as unknown as AgencyProfile).catch(() => null),
      ),
    ).then((results) => setRecentAgencies(results.filter(Boolean) as AgencyProfile[]))
  }, [])

  const filters = searchParamsToFilters(searchParams)
  const category = categoryFromParams(searchParams)

  const setCategory = (cat: BrowseCategory) => {
    const next = new URLSearchParams(searchParams)
    if (cat === 'all') next.delete('category')
    else next.set('category', cat)
    setSearchParams(next)
  }

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'all' || value === 'All UAE') next.delete(key)
    else next.set(key, value)
    setSearchParams(next)
  }

  const listings = useMemo(() => {
    let result = filterListings(allListings, filters)
    if (category === 'direct') result = result.filter((l) => l.isDirectMedia)
    else if (category !== 'all') result = result.filter((l) => l.mediaType === category)

    result = [...result]
    if (sort === 'price-asc') result.sort((a, b) => a.budgetMin - b.budgetMin)
    else if (sort === 'rating') result.sort((a, b) => b.rating - a.rating)
    else result.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return result
  }, [allListings, filters, category, sort])

  return (
    <div>
      <CategoryFilterBar active={category} onChange={setCategory} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Browse media placements</h1>
            <p className="mt-1 text-sm text-slate-500">{listings.length} placements found</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.city}
              onChange={(e) => updateFilter('city', e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={filters.budget}
              onChange={(e) => updateFilter('budget', e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              {BUDGET_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="price-asc">Price: low to high</option>
              <option value="rating">Highest rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {recentAgencies.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-lg font-bold text-slate-900">Recently viewed</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recentAgencies.map((a) => (
                <Link key={a.id} to={`/agency/${a.id}`}
                  className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm hover:border-indigo-300">
                  {a.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">
            <p className="text-slate-600">No listings yet. Media owners can publish after admin approval.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <MediaCard key={listing.id} listing={listing} onBook={() => setQuoteListing(listing)} />
            ))}
          </div>
        )}
      </div>

      {quoteListing && (
        <RequestQuoteModal
          listing={quoteListing}
          onClose={() => setQuoteListing(null)}
          onSuccess={(name) => {
            showToast(`Quote sent to ${name}`)
            setQuoteListing(null)
          }}
        />
      )}
    </div>
  )
}
