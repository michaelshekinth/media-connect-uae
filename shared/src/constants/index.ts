import type { BudgetRange, City, MediaType, SearchFilters } from '../types'

export const MEDIA_TYPES: MediaType[] = [
  'OOH',
  'DOOH',
  'TC',
  'Radio & Print',
  'Influencers',
]

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
