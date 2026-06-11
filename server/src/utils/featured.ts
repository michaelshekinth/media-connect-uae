export interface FeaturedAgency {
  featured?: boolean
  featuredFrom?: string | null
  featuredUntil?: string | null
  featuredCities?: string[]
  city?: string
}

export function isFeaturedActive(a: FeaturedAgency): boolean {
  if (!a.featured) return false
  const now = Date.now()
  if (a.featuredFrom && new Date(a.featuredFrom).getTime() > now) return false
  if (a.featuredUntil && new Date(a.featuredUntil).getTime() < now) return false
  return true
}

export function matchesFeaturedCity(a: FeaturedAgency, city: string): boolean {
  if (!city || city === 'All UAE' || city === 'all') return true
  if (!a.featuredCities?.length) return a.city === city
  return a.featuredCities.includes(city) || a.city === city
}
