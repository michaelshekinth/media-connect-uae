import type {
  CustomQuote,
  InboundLead,
  OwnerChatThread,
  OwnerCompanyProfile,
  OwnerListing,
  OwnerNotification,
  OwnerStats,
} from '@shared/types/owner'
import type { QuoteRequest } from '@shared/types/user'
import { apiFetch } from '@shared/services/apiClient'

const role = 'media_owner' as const

export async function getCompanyProfile(_agencyId: string): Promise<OwnerCompanyProfile | null> {
  return apiFetch<OwnerCompanyProfile | null>('/owner/company-profile', { role })
}

export async function saveCompanyProfile(_agencyId: string, profile: OwnerCompanyProfile) {
  return apiFetch('/owner/company-profile', { method: 'PUT', body: JSON.stringify(profile), role })
}

export async function submitCompanyProfile(profile: OwnerCompanyProfile) {
  await saveCompanyProfile('', profile)
  await apiFetch('/owner/company-profile/submit', { method: 'POST', body: JSON.stringify(profile), role })
}

export async function getOwnerListings(_agencyId: string): Promise<OwnerListing[]> {
  return apiFetch<OwnerListing[]>('/owner/listings', { role })
}

export async function getOwnerListing(_agencyId: string, listingId: string): Promise<OwnerListing | undefined> {
  try {
    return await apiFetch<OwnerListing>(`/owner/listings/${listingId}`, { role })
  } catch {
    return undefined
  }
}

export async function createOwnerListing(_agencyId: string, listing: Partial<OwnerListing>) {
  return apiFetch<OwnerListing>('/owner/listings', { method: 'POST', body: JSON.stringify(listing), role })
}

export async function addOwnerListing(agencyId: string, listing: OwnerListing) {
  const created = await createOwnerListing(agencyId, { ...listing, status: 'pending_approval' })
  await submitListingForApproval(agencyId, created.id)
  return created
}

export async function updateOwnerListing(_agencyId: string, listing: OwnerListing) {
  return apiFetch<OwnerListing>(`/owner/listings/${listing.id}`, { method: 'PUT', body: JSON.stringify(listing), role })
}

export async function deleteOwnerListing(_agencyId: string, listingId: string) {
  await apiFetch(`/owner/listings/${listingId}`, { method: 'DELETE', role })
}

export async function submitListingForApproval(_agencyId: string, listingId: string) {
  return apiFetch(`/owner/listings/${listingId}/submit`, { method: 'POST', role })
}

export async function getInboundLeads(_agencyId: string): Promise<InboundLead[]> {
  const leads = await apiFetch<InboundLead[]>('/owner/leads', { role })
  return leads
}

export async function getOwnerChats(_agencyId: string): Promise<OwnerChatThread[]> {
  return apiFetch<OwnerChatThread[]>('/owner/chats', { role })
}

export async function sendOwnerMessage(_agencyId: string, threadId: string, text: string) {
  try {
    await apiFetch(`/owner/chats/${threadId}/messages`, { method: 'POST', body: JSON.stringify({ text }), role })
    return { ok: true as const }
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : 'Send failed' }
  }
}

export async function markOwnerThreadRead(_agencyId: string, threadId: string) {
  await apiFetch(`/owner/chats/${threadId}/read`, { method: 'POST', role })
}

export async function getCustomQuotes(_agencyId: string): Promise<CustomQuote[]> {
  return apiFetch<CustomQuote[]>('/owner/custom-quotes', { role })
}

export async function addCustomQuote(_agencyId: string, quote: CustomQuote) {
  return apiFetch('/owner/custom-quotes', { method: 'POST', body: JSON.stringify(quote), role })
}

export async function getOwnerNotifications(_agencyId: string): Promise<OwnerNotification[]> {
  return apiFetch<OwnerNotification[]>('/owner/notifications', { role })
}

export async function markOwnerNotificationRead(_agencyId: string, _id: string) {
  /* optional future endpoint */
}

export async function markAllOwnerNotificationsRead(_agencyId: string) {
  /* optional */
}

export async function addOwnerNotification() {
  /* server-side only */
}

export async function getOwnerStats(_agencyId: string, _days: number): Promise<OwnerStats> {
  return apiFetch<OwnerStats>('/owner/stats', { role })
}

export async function getOwnerUnreadChatCount(agencyId: string): Promise<number> {
  const chats = await getOwnerChats(agencyId)
  return chats.filter((c) => c.unread).length
}

export async function getUnreadOwnerNotificationCount(_agencyId: string): Promise<number> {
  const items = await getOwnerNotifications('')
  return items.filter((n) => !n.read).length
}

export function createInboundLeadFromQuote(quote: QuoteRequest, advertiserId: string, advertiserName: string, advertiserEmail: string): InboundLead {
  return {
    id: quote.id,
    quoteRequestId: quote.id,
    agencyId: quote.agencyId,
    advertiserId,
    advertiserName,
    advertiserEmail,
    campaignName: quote.campaignName,
    mediaType: quote.mediaType,
    budgetRange: quote.budgetRange,
    startDate: quote.startDate,
    endDate: quote.endDate,
    message: quote.message,
    listingId: quote.listingId,
    status: 'pending',
    createdAt: quote.createdAt,
  }
}

export async function addInboundLead() {}
export async function getOrCreateOwnerThread() { return null }
export async function addOwnerChatMessage() {}
export async function updateLeadStatus() {}
export async function updateCustomQuoteStatus() {}
