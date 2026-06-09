import { DEFAULT_FILTERS } from '@shared/constants'
import type { SearchFilters } from '@shared/types'
import type { BrowseCategory } from '@shared/types/user'

export function filtersToSearchParams(filters: SearchFilters): URLSearchParams {
  const p = new URLSearchParams()
  if (filters.mediaType !== 'all') p.set('mediaType', filters.mediaType)
  if (filters.city !== 'All UAE') p.set('city', filters.city)
  if (filters.budget !== 'all') p.set('budget', filters.budget)
  if (filters.availability !== 'all') p.set('availability', filters.availability)
  if (filters.format !== 'all') p.set('format', filters.format)
  if (filters.rating4Plus) p.set('rating4Plus', '1')
  return p
}

export function searchParamsToFilters(params: URLSearchParams): SearchFilters {
  return {
    mediaType: (params.get('mediaType') as SearchFilters['mediaType']) || DEFAULT_FILTERS.mediaType,
    city: (params.get('city') as SearchFilters['city']) || DEFAULT_FILTERS.city,
    budget: (params.get('budget') as SearchFilters['budget']) || DEFAULT_FILTERS.budget,
    availability:
      (params.get('availability') as SearchFilters['availability']) ||
      DEFAULT_FILTERS.availability,
    format: (params.get('format') as SearchFilters['format']) || DEFAULT_FILTERS.format,
    rating4Plus: params.get('rating4Plus') === '1',
  }
}

export function browsePathFromFilters(filters: SearchFilters) {
  const qs = filtersToSearchParams(filters).toString()
  return qs ? `/browse?${qs}` : '/browse'
}

export function categoryFromParams(params: URLSearchParams): BrowseCategory {
  const cat = params.get('category')
  if (!cat || cat === 'all') return 'all'
  if (cat === 'direct') return 'direct'
  return cat as BrowseCategory
}
