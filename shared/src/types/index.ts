export type { MediaType, MediaCategory, Subcategory, SubcategoryRequest } from './categories'
export { MEDIA_CATEGORIES, MEDIA_CATEGORY_LABELS, normalizeMediaType } from './categories'

export type City =
  | 'All UAE'
  | 'Dubai'
  | 'Abu Dhabi'
  | 'Sharjah'
  | 'Ajman'
  | 'Ras Al Khaimah'
  | 'Fujairah'
  | 'Umm Al Quwain'

export type BudgetRange =
  | 'all'
  | 'under-10k'
  | '10k-20k'
  | '20k-25k'
  | '25k-30k'
  | '30k-50k'
  | '50k-plus'

export type Availability = 'all' | 'immediate' | '1-2-weeks'
export type Format = 'all' | 'billboard' | 'mall' | 'transit' | 'social'

export interface SearchFilters {
  mediaType: MediaType | 'all'
  city: City
  budget: BudgetRange
  availability: Availability
  format: Format
  rating4Plus: boolean
  subcategory: string
  search?: string
}

import type { MediaType } from './categories'

export interface Listing {
  id: string
  title: string
  mediaType: MediaType
  subcategory?: string
  city: Exclude<City, 'All UAE'>
  budgetMin: number
  budgetMax: number
  imageUrl: string
  agencyId: string
  agencyName: string
  lat: number
  lng: number
  availability: Exclude<Availability, 'all'>
  format: Exclude<Format, 'all'>
  rating: number
  isDirectMedia: boolean
  assetOwnership?: 'owned' | 'leased' | null
  featured?: boolean
  descriptionShort: string
  galleryImages: string[]
  createdAt: string
}

export interface ListingDetail extends Listing {
  subcategory: string
  mediaCategory: string
  area: string
  landmark: string
  sizeWidth: string
  sizeHeight: string
  sizeUnit: string
  pricingType: 'fixed' | 'range' | 'starting_price' | 'on_request'
  billingDuration: string
  aboutPlacement?: string
  objectives?: string[]
  oohType?: string
  descriptionLong: string
  deliverables: string[]
  agency?: {
    id: string
    name: string
    initials: string
    color: string
    verified: boolean
    mediaTypes: MediaType[]
  }
}

export interface Agency {
  id: string
  name: string
  city: Exclude<City, 'All UAE'>
  lat: number
  lng: number
  mediaTypes: MediaType[]
  listingCount: number
}

export interface MediaOwner {
  id: string
  name: string
  initials: string
  color: string
  about: string
  rating: number
  reviewCount: number
  priceFrom: number
  listingCount: number
  mediaTypes: MediaType[]
  headquarters: Exclude<City, 'All UAE'>
  responseHours: number
  verified: boolean
}

export interface CityConfig {
  name: Exclude<City, 'All UAE'>
  lat: number
  lng: number
  zoom: number
}

export type AuthMode = 'login' | 'signup' | null
