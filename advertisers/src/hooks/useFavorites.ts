import { useCallback, useEffect, useState } from 'react'
import {
  getFavorites,
  isFavoriteAgency,
  isFavoriteListing,
  toggleFavoriteAgency,
  toggleFavoriteListing,
} from '../services/userStore'
import type { Favorites } from '@shared/types/user'

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorites>({ agencyIds: [], listingIds: [] })

  const refresh = useCallback(async () => {
    const data = await getFavorites()
    setFavorites(data)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const toggleAgency = useCallback(async (id: string) => {
    await toggleFavoriteAgency(id)
    await refresh()
    return isFavoriteAgency(id)
  }, [refresh])

  const toggleListing = useCallback(async (id: string) => {
    await toggleFavoriteListing(id)
    await refresh()
    return isFavoriteListing(id)
  }, [refresh])

  return { favorites, toggleAgency, toggleListing, refresh }
}
