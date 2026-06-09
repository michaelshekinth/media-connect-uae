import { useMemo } from 'react'
import type { BudgetRange, Listing, SearchFilters } from '../types'

function matchesBudget(
  listing: Listing,
  budget: BudgetRange,
): boolean {
  if (budget === 'all') return true

  const ranges: Record<Exclude<BudgetRange, 'all'>, [number, number]> = {
    'under-10k': [0, 10000],
    '10k-20k': [10000, 20000],
    '20k-25k': [20000, 25000],
    '25k-30k': [25000, 30000],
    '30k-50k': [30000, 50000],
    '50k-plus': [50000, Infinity],
  }

  const [min, max] = ranges[budget]
  return listing.budgetMin < max && listing.budgetMax > min
}

export function filterListings(
  listings: Listing[],
  filters: SearchFilters,
): Listing[] {
  return listings.filter((listing) => {
    if (filters.mediaType !== 'all' && listing.mediaType !== filters.mediaType) {
      return false
    }
    if (filters.city !== 'All UAE' && listing.city !== filters.city) {
      return false
    }
    if (!matchesBudget(listing, filters.budget)) {
      return false
    }
    if (
      filters.availability !== 'all' &&
      listing.availability !== filters.availability
    ) {
      return false
    }
    if (filters.format !== 'all' && listing.format !== filters.format) {
      return false
    }
    if (filters.rating4Plus && listing.rating < 4) {
      return false
    }
    return true
  })
}

export function useFilteredListings(
  listings: Listing[],
  filters: SearchFilters,
) {
  return useMemo(() => filterListings(listings, filters), [listings, filters])
}

export function formatBudgetRange(min: number, max: number): string {
  const fmt = (n: number) =>
    n >= 1000 ? `${Math.round(n / 1000)}K` : `${n}`
  if (max >= 100000) return `From ${fmt(min)} AED`
  return `${fmt(min)} – ${fmt(max)} AED`
}
