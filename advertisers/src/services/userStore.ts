import type { SearchFilters } from '@shared/types'
import type {
  ActivityEvent,
  AppNotification,
  ChatThread,
  Favorites,
  QuoteRequest,
  SearchHistoryEntry,
} from '@shared/types/user'
import type { AdvertiserSubscription } from '@shared/types/admin'
import type { Listing } from '@shared/types'
import { apiFetch, getToken } from '@shared/services/apiClient'

const role = 'advertiser' as const

export { fetchAgencies, fetchAgency, fetchListings } from '@shared/services/publicApi'

export async function getFavorites(): Promise<Favorites> {
  return apiFetch<Favorites>('/advertiser/favorites', { role })
}

export async function saveFavorites(favorites: Favorites) {
  return apiFetch<Favorites>('/advertiser/favorites', { method: 'PUT', body: JSON.stringify(favorites), role })
}

export async function toggleFavoriteAgency(agencyId: string): Promise<boolean> {
  const fav = await getFavorites()
  const ids = fav.agencyIds
  const next = ids.includes(agencyId) ? ids.filter((id) => id !== agencyId) : [...ids, agencyId]
  await saveFavorites({ ...fav, agencyIds: next })
  return !ids.includes(agencyId)
}

export async function isFavoriteAgency(agencyId: string): Promise<boolean> {
  const fav = await getFavorites()
  return fav.agencyIds.includes(agencyId)
}

export async function isFavoriteListing(listingId: string): Promise<boolean> {
  if (!getToken('advertiser')) return false
  const fav = await getFavorites()
  return fav.listingIds.includes(listingId)
}

export async function toggleFavoriteListing(listingId: string): Promise<boolean> {
  const fav = await getFavorites()
  const ids = fav.listingIds
  const next = ids.includes(listingId) ? ids.filter((id) => id !== listingId) : [...ids, listingId]
  await saveFavorites({ ...fav, listingIds: next })
  return !ids.includes(listingId)
}

export async function addRecentlyViewed(agencyId: string) {
  await apiFetch(`/advertiser/recently-viewed/${agencyId}`, { method: 'POST', role })
}

export function getRecentlyViewed(): string[] {
  const raw = localStorage.getItem('mcuae_user')
  if (!raw) return []
  try {
    return (JSON.parse(raw) as { recentlyViewed?: string[] }).recentlyViewed ?? []
  } catch {
    return []
  }
}

export async function addQuote(quote: Omit<QuoteRequest, 'id' | 'status' | 'createdAt'>) {
  return submitQuote(quote)
}

export async function submitQuote(quote: Omit<QuoteRequest, 'id' | 'status' | 'createdAt'>) {
  return apiFetch<QuoteRequest>('/advertiser/quotes', { method: 'POST', body: JSON.stringify(quote), role })
}

export async function getQuotes(): Promise<QuoteRequest[]> {
  return apiFetch<QuoteRequest[]>('/advertiser/quotes', { role })
}

export async function updateQuoteStatus(quoteId: string, status: 'accepted' | 'declined') {
  return apiFetch<QuoteRequest>(`/advertiser/quotes/${quoteId}/${status}`, { method: 'PATCH', role })
}

export async function getChats(): Promise<ChatThread[]> {
  return apiFetch<ChatThread[]>('/advertiser/chats', { role })
}

export async function sendChatMessage(threadId: string, text: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await apiFetch(`/advertiser/chats/${threadId}/messages`, { method: 'POST', body: JSON.stringify({ text }), role })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Send failed' }
  }
}

export async function markThreadRead(threadId: string) {
  await apiFetch(`/advertiser/chats/${threadId}/read`, { method: 'POST', role })
}

export async function syncFromBridge() {
  /* no-op — server is source of truth */
}

export async function getNotifications(): Promise<AppNotification[]> {
  return apiFetch<AppNotification[]>('/advertiser/notifications', { role })
}

export async function getActivities(): Promise<ActivityEvent[]> {
  return apiFetch<ActivityEvent[]>('/advertiser/activities', { role })
}

export async function addActivity(_type: string, _title: string, _description: string) {
  /* server creates activities on key actions */
}

export async function getSearchHistory(): Promise<SearchHistoryEntry[]> {
  return apiFetch<SearchHistoryEntry[]>('/advertiser/search-history', { role })
}

export async function addSearchHistory(filters: SearchFilters, resultCount: number) {
  await apiFetch('/advertiser/search-history', { method: 'POST', body: JSON.stringify({ filters, resultCount }), role })
}

export async function clearSearchHistory() {
  await apiFetch('/advertiser/search-history', { method: 'DELETE', role })
}

export async function getFavoriteCount(): Promise<number> {
  const fav = await getFavorites()
  return fav.agencyIds.length + fav.listingIds.length
}

export function getSubscription(): AdvertiserSubscription | null {
  const raw = localStorage.getItem('mcuae_user')
  if (!raw) return null
  try {
    const user = JSON.parse(raw) as { subscription?: AdvertiserSubscription }
    const sub = user.subscription
    if (!sub || new Date(sub.expiresAt) < new Date()) return null
    return sub
  } catch {
    return null
  }
}

export async function subscribeToPackage(pkg: { id: string; name: string; durationDays: number; contactViewsIncluded: number }) {
  const sub = await apiFetch<AdvertiserSubscription>('/advertiser/subscribe', {
    method: 'POST',
    body: JSON.stringify({ packageId: pkg.id }),
    role,
  })
  const raw = localStorage.getItem('mcuae_user')
  if (raw) {
    const user = JSON.parse(raw)
    user.subscription = sub
    localStorage.setItem('mcuae_user', JSON.stringify(user))
  }
  return sub
}

export async function hasRevealedContact(agencyId: string): Promise<boolean> {
  const sub = getSubscription()
  return sub?.revealedAgencyIds?.includes(agencyId) ?? false
}

export async function canRevealContact(agencyId: string): Promise<boolean> {
  if (await hasRevealedContact(agencyId)) return true
  const sub = getSubscription()
  return !!sub && sub.contactViewsRemaining > 0
}

export async function revealAgencyContact(agencyId: string): Promise<boolean> {
  try {
    await apiFetch(`/advertiser/reveal-contact/${agencyId}`, { method: 'POST', role })
    await refreshSubscriptionFromServer()
    return true
  } catch {
    return false
  }
}

async function refreshSubscriptionFromServer() {
  const data = await apiFetch<{ user: { subscription?: AdvertiserSubscription } }>('/auth/me', { role })
  const raw = localStorage.getItem('mcuae_user')
  if (raw && data.user) {
    const user = JSON.parse(raw)
    user.subscription = data.user.subscription
    localStorage.setItem('mcuae_user', JSON.stringify(user))
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  const n = await getNotifications()
  return n.filter((x) => !x.read).length
}

export async function getUnreadChatCount(): Promise<number> {
  const chats = await getChats()
  return chats.filter((c) => c.unread).length
}

export async function getPendingQuoteCount(): Promise<number> {
  const quotes = await getQuotes()
  return quotes.filter((q) => q.status === 'pending' || q.status === 'responded').length
}
