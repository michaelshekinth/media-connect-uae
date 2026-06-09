import type { Listing, ListingDetail } from '../types'
import { ApiError, apiFetch } from './apiClient'
import { fetchListings } from './publicApi'

export async function getAllListings(): Promise<Listing[]> {
  return fetchListings()
}

export async function getListingById(id: string): Promise<ListingDetail | null> {
  try {
    return await apiFetch<ListingDetail>(`/public/listings/${id}`, { auth: false })
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

export async function getListingsForAgency(agencyId: string, _agencyName?: string): Promise<Listing[]> {
  const all = await fetchListings()
  return all.filter((l) => l.agencyId === agencyId)
}

export async function getSimilarListings(current: Listing, limit = 4): Promise<Listing[]> {
  const all = await fetchListings()
  return all
    .filter((l) => l.id !== current.id)
    .map((l) => {
      let score = 0
      if (l.mediaType === current.mediaType) score += 3
      if (l.city === current.city) score += 2
      if (l.agencyId === current.agencyId) score += 1
      return { listing: l, score }
    })
    .sort((a, b) => b.score - a.score || b.listing.rating - a.listing.rating)
    .slice(0, limit)
    .map(({ listing }) => listing)
}
