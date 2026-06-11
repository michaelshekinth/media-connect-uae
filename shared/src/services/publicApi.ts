import type { SearchFilters, Listing, Subcategory } from '../types'
import { apiFetch } from './apiClient'

export interface PublicCmsContent {
  heroImagesByEmirate: Record<string, string>
  howItWorks: {
    title?: string
    steps?: { title: string; description: string }[]
  }
}

interface PaginatedListings {
  items: Listing[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

export async function fetchListings(filters?: Partial<SearchFilters>): Promise<Listing[]> {
  const params = new URLSearchParams()
  if (filters?.mediaType && filters.mediaType !== 'all') params.set('mediaType', filters.mediaType)
  if (filters?.city && filters.city !== 'All UAE') params.set('city', filters.city)
  if (filters?.subcategory && filters.subcategory !== 'all') {
    params.set('subcategory', filters.subcategory)
  }
  if (filters?.search?.trim()) params.set('search', filters.search.trim())
  const q = params.toString()
  const data = await apiFetch<Listing[] | PaginatedListings>(`/public/listings${q ? `?${q}` : ''}`, {
    auth: false,
  })
  return Array.isArray(data) ? data : data.items
}

export async function fetchAgency(id: string) {
  return apiFetch<Record<string, unknown>>(`/public/agencies/${id}`, { auth: false })
}

export async function fetchAgencies(options?: { featured?: boolean; city?: string }) {
  const params = new URLSearchParams()
  if (options?.featured) params.set('featured', 'true')
  if (options?.city && options.city !== 'All UAE') params.set('city', options.city)
  const q = params.toString()
  return apiFetch<unknown[]>(`/public/agencies${q ? `?${q}` : ''}`, { auth: false })
}

export async function fetchPublicCms(): Promise<PublicCmsContent> {
  return apiFetch<PublicCmsContent>('/public/cms', { auth: false })
}

export async function fetchSubcategories(category?: string): Promise<Subcategory[]> {
  const q = category ? `?category=${encodeURIComponent(category)}` : ''
  return apiFetch<Subcategory[]>(`/public/subcategories${q}`, { auth: false })
}
