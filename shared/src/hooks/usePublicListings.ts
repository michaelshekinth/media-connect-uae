import { useEffect, useState } from 'react'
import { fetchListings } from '../services/publicApi'
import type { Listing } from '../types'

const MAX_RETRIES = 6
const RETRY_MS = 800

export function usePublicListings() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async (attempt = 0) => {
      try {
        const data = await fetchListings()
        if (cancelled) return
        setListings(data)
        setError(null)
        setLoading(false)
      } catch {
        if (cancelled) return
        if (attempt < MAX_RETRIES) {
          window.setTimeout(() => load(attempt + 1), RETRY_MS)
          return
        }
        setListings([])
        setError('Could not load listings. Make sure the API is running (npm run dev:all).')
        setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { listings, loading, error }
}
