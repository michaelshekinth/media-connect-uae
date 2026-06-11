import type { BudgetRange, City, SearchFilters } from '../types'
import { MEDIA_CATEGORIES, MEDIA_CATEGORY_LABELS, type MediaCategory, type MediaType } from '../types/categories'

export { MEDIA_CATEGORIES, MEDIA_CATEGORY_LABELS, type MediaCategory, type MediaType }
export const MEDIA_TYPES: MediaType[] = [...MEDIA_CATEGORIES]

export const CITIES: City[] = [
  'All UAE',
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain',
]

export const UAE_CITIES = CITIES.filter((c) => c !== 'All UAE') as Exclude<
  City,
  'All UAE'
>[]

export const BUDGET_OPTIONS: { value: BudgetRange; label: string }[] = [
  { value: 'all', label: 'Any budget' },
  { value: 'under-10k', label: 'Under 10K AED' },
  { value: '10k-20k', label: '10K – 20K AED' },
  { value: '20k-25k', label: '20K – 25K AED' },
  { value: '25k-30k', label: '25K – 30K AED' },
  { value: '30k-50k', label: '30K – 50K AED' },
  { value: '50k-plus', label: '50K+ AED' },
]

export const DEFAULT_FILTERS: SearchFilters = {
  mediaType: 'all',
  city: 'All UAE',
  budget: 'all',
  availability: 'all',
  format: 'all',
  rating4Plus: false,
  subcategory: 'all',
}

/** Tailwind badge classes keyed by PDF V1 media category */
export const MEDIA_CATEGORY_COLORS: Record<
  MediaCategory,
  { solid: string; soft: string; chip: 'indigo' | 'violet' | 'blue' | 'emerald' | 'orange' }
> = {
  OOH: { solid: 'bg-indigo-600', soft: 'bg-indigo-100 text-indigo-700', chip: 'indigo' },
  TV: { solid: 'bg-blue-600', soft: 'bg-blue-100 text-blue-700', chip: 'blue' },
  Radio: { solid: 'bg-emerald-600', soft: 'bg-emerald-100 text-emerald-700', chip: 'emerald' },
  Press: { solid: 'bg-violet-600', soft: 'bg-violet-100 text-violet-700', chip: 'violet' },
  ContentCreators: { solid: 'bg-orange-500', soft: 'bg-orange-100 text-orange-700', chip: 'orange' },
}

export const CITY_CONFIGS: Record<
  Exclude<City, 'All UAE'>,
  { lat: number; lng: number; zoom: number }
> = {
  Dubai: { lat: 25.2048, lng: 55.2708, zoom: 11 },
  'Abu Dhabi': { lat: 24.4539, lng: 54.3773, zoom: 11 },
  Sharjah: { lat: 25.3462, lng: 55.4209, zoom: 12 },
  Ajman: { lat: 25.4052, lng: 55.5136, zoom: 12 },
  'Ras Al Khaimah': { lat: 25.7895, lng: 55.9432, zoom: 11 },
  Fujairah: { lat: 25.1288, lng: 56.3265, zoom: 11 },
  'Umm Al Quwain': { lat: 25.5647, lng: 55.5552, zoom: 12 },
}

export const UAE_MAP_CENTER = { lat: 24.5, lng: 54.4 }
export const UAE_MAP_ZOOM = 7
