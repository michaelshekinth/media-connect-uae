export type MediaCategory = 'OOH' | 'TV' | 'Radio' | 'Press' | 'ContentCreators'

export const MEDIA_CATEGORIES: MediaCategory[] = ['OOH', 'TV', 'Radio', 'Press', 'ContentCreators']

export function isValidMediaCategory(value: string): value is MediaCategory {
  return (MEDIA_CATEGORIES as string[]).includes(value)
}

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
