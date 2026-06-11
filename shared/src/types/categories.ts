/** PDF V1 fixed top-level categories */
export type MediaCategory = 'OOH' | 'TV' | 'Radio' | 'Press' | 'ContentCreators'

export type MediaType = MediaCategory

export const MEDIA_CATEGORIES: MediaCategory[] = [
  'OOH',
  'TV',
  'Radio',
  'Press',
  'ContentCreators',
]

export const MEDIA_CATEGORY_LABELS: Record<MediaCategory, string> = {
  OOH: 'OOH',
  TV: 'TV',
  Radio: 'Radio',
  Press: 'Press',
  ContentCreators: 'Content Creators',
}

/** @deprecated Use MediaCategory — maps legacy values for migration */
export function normalizeMediaType(value: string): MediaCategory {
  const map: Record<string, MediaCategory> = {
    OOH: 'OOH',
    DOOH: 'OOH',
    TC: 'TV',
    TV: 'TV',
    Radio: 'Radio',
    'Radio & Print': 'Radio',
    Print: 'Press',
    Press: 'Press',
    Influencers: 'ContentCreators',
    ContentCreators: 'ContentCreators',
    'OOH/DOOH': 'OOH',
  }
  return map[value] ?? 'OOH'
}

export interface Subcategory {
  id: string
  categoryId: MediaCategory
  name: string
  active: boolean
  sortOrder: number
}

export interface SubcategoryRequest {
  id: string
  agencyId: string
  categoryId: MediaCategory
  proposedName: string
  status: 'pending' | 'approved' | 'rejected'
  adminNotes?: string
  createdAt: string
}
