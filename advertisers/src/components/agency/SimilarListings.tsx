import { MediaCard } from '../browse/MediaCard'
import type { Listing } from '@shared/types'

export function SimilarListings({ listings }: { listings: Listing[] }) {
  if (listings.length === 0) return null

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {listings.map((listing) => (
        <MediaCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
