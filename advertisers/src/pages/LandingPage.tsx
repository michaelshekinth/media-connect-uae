import { useEffect, useState } from 'react'
import { FeaturedCategories } from '../components/sections/FeaturedCategories'
import { FeaturedLocations } from '../components/sections/FeaturedLocations'
import { Hero } from '../components/sections/Hero'
import { HowItWorks } from '../components/sections/HowItWorks'
import { RecentListings } from '../components/sections/RecentListings'
import { SearchBar } from '../components/sections/SearchBar'
import { TopMediaOwners } from '../components/sections/TopMediaOwners'
import { DEFAULT_FILTERS } from '@shared/constants'
import { usePublicListings } from '@shared/hooks/usePublicListings'
import { useFilteredListings } from '@shared/hooks/useSearchFilters'
import { fetchPublicCms } from '@shared/services/publicApi'
import type { MediaType, SearchFilters } from '@shared/types'

const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&q=85'

export function LandingPage() {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedMapCity, setSelectedMapCity] = useState<string | null>(null)
  const [heroImagesByEmirate, setHeroImagesByEmirate] = useState<Record<string, string>>({})
  const { listings, loading, error } = usePublicListings()

  useEffect(() => {
    fetchPublicCms()
      .then((cms) => setHeroImagesByEmirate(cms.heroImagesByEmirate ?? {}))
      .catch(() => {})
  }, [])

  const filteredListings = useFilteredListings(listings, filters)
  const displayListings = hasSearched ? filteredListings : listings

  const selectedEmirate = filters.city !== 'All UAE' ? filters.city : null
  const heroImage =
    (selectedEmirate && heroImagesByEmirate[selectedEmirate]) || DEFAULT_HERO_IMAGE

  const handleCategorySelect = (type: MediaType) => {
    setFilters((prev) => ({ ...prev, mediaType: type }))
    setHasSearched(true)
    document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main>
      <Hero heroImage={heroImage} selectedEmirate={selectedEmirate} />
      <SearchBar
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={() => setHasSearched(true)}
        resultCount={filteredListings.length}
        totalListings={listings.length}
        hasSearched={hasSearched}
        heroImage={heroImage}
      />
      {error && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</p>
        </div>
      )}
      <HowItWorks />
      <FeaturedCategories listings={listings} onSelectCategory={handleCategorySelect} />
      <RecentListings listings={displayListings} hasSearched={hasSearched} loading={loading} />
      <FeaturedLocations selectedCity={selectedMapCity} onCitySelect={setSelectedMapCity} />
      <TopMediaOwners city={filters.city} />
    </main>
  )
}
