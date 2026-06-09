import { useCallback, useEffect, useState } from 'react'
import { addQuote, getQuotes } from '../services/userStore'
import type { QuoteRequest } from '@shared/types/user'

export function useQuotes() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([])

  const refresh = useCallback(async () => {
    const data = await getQuotes()
    setQuotes(data)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const submitQuote = useCallback(
    async (quote: Omit<QuoteRequest, 'id' | 'createdAt' | 'status'>) => {
      const created = await addQuote(quote)
      await refresh()
      return created
    },
    [refresh],
  )

  return { quotes, submitQuote, refresh }
}
