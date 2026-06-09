import type { SearchFilters, Listing } from '../types'
import { apiFetch } from './apiClient'

export async function fetchListings(filters?: Partial<SearchFilters>): Promise<Listing[]> {
  const params = new URLSearchParams()
  if (filters?.mediaType && filters.mediaType !== 'all') params.set('mediaType', filters.mediaType)
  if (filters?.city && filters.city !== 'All UAE') params.set('city', filters.city)
  const q = params.toString()
  return apiFetch<Listing[]>(`/public/listings${q ? `?${q}` : ''}`, { auth: false })
}

export async function fetchAgency(id: string) {
  return apiFetch<Record<string, unknown>>(`/public/agencies/${id}`, { auth: false })
}

export async function fetchAgencies(featured = false) {
  return apiFetch<unknown[]>(`/public/agencies${featured ? '?featured=true' : ''}`, { auth: false })
}
