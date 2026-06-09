import type { AdminConfig, AdminAuditEntry, AdvertiserSubscription } from '@shared/types/admin'
import type { OwnerCompanyProfile, OwnerListing, InboundLead, CustomQuote, OwnerChatThread } from '@shared/types/owner'
import type { User, QuoteRequest } from '@shared/types/user'
import { apiFetch } from '@shared/services/apiClient'

const role = 'super_admin' as const

export interface AdminDashboardStats {
  pendingProfiles: number
  pendingListings: number
  totalAdvertisers: number
  approvedOwners: number
  totalMediaOwners: number
  totalRFQs: number
  totalChats: number
  totalUsers: number
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  return apiFetch<AdminDashboardStats>('/admin/dashboard', { role })
}

export async function getAllAdvertisers() {
  return apiFetch<(User & { quotesCount: number; subscription: AdvertiserSubscription | null })[]>('/admin/users', { role })
}

export async function getAdvertiserDetail(userId: string) {
  return apiFetch<{ user: User; data: { quotes: QuoteRequest[]; subscription?: AdvertiserSubscription } }>(`/admin/users/${userId}`, { role })
}

export async function updateAdvertiser(userId: string, updates: Partial<User>) {
  return apiFetch(`/admin/users/${userId}`, { method: 'PATCH', body: JSON.stringify(updates), role })
}

export async function getAllMediaOwners(status?: 'pending' | 'approved' | 'rejected') {
  const q = status ? `?status=${status}` : ''
  return apiFetch<(User & { companyProfile: OwnerCompanyProfile | null; listingsCount: number; liveListings: number })[]>(`/admin/media-owners${q}`, { role })
}

export async function getMediaOwnerDetail(agencyId: string) {
  return apiFetch<{
    user: User
    data: {
      companyProfile: OwnerCompanyProfile | null
      listings: OwnerListing[]
      leads: InboundLead[]
      chats: OwnerChatThread[]
      customQuotes: CustomQuote[]
    }
  }>(`/admin/media-owners/${agencyId}`, { role })
}

export async function getAllListings(filters?: { status?: string; agencyId?: string }) {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.agencyId) params.set('agencyId', filters.agencyId)
  const q = params.toString()
  return apiFetch<{ listing: OwnerListing; agencyId: string; companyName: string }[]>(`/admin/listings${q ? `?${q}` : ''}`, { role })
}

export async function getAllPendingListings() {
  return getAllListings({ status: 'pending_approval' })
}

export async function getPendingOwnerProfiles() {
  return apiFetch<{ agencyId: string; companyName: string; user: User }[]>('/admin/pending-profiles', { role })
}

export async function getAllRFQs() {
  return apiFetch<(InboundLead & { agencyId: string; ownerName: string })[]>('/admin/rfqs', { role })
}

export async function getAllCustomQuotes() {
  return apiFetch<(CustomQuote & { agencyId: string; ownerName: string })[]>('/admin/quotes', { role })
}

export interface AdminChatThreadView {
  threadId: string
  agencyId: string
  ownerName: string
  advertiserId: string
  advertiserName: string
  lastMessage: string
  messages: { sender: string; text: string; createdAt: string; quoteCard?: unknown }[]
  updatedAt: string
}

export async function getAllChatThreads(): Promise<AdminChatThreadView[]> {
  return apiFetch<AdminChatThreadView[]>('/admin/chats', { role })
}

export async function adminApproveProfile(agencyId: string, _adminEmail: string) {
  await apiFetch(`/admin/approve-profile/${agencyId}`, { method: 'POST', role })
}

export async function adminRejectProfile(agencyId: string, reason: string, _adminEmail: string) {
  await apiFetch(`/admin/reject-profile/${agencyId}`, { method: 'POST', body: JSON.stringify({ reason }), role })
}

export async function adminApproveListing(agencyId: string, listingId: string, _adminEmail: string) {
  await apiFetch(`/admin/approve-listing/${agencyId}/${listingId}`, { method: 'POST', role })
}

export async function adminRejectListing(agencyId: string, listingId: string, reason: string, _adminEmail: string) {
  await apiFetch(`/admin/reject-listing/${agencyId}/${listingId}`, { method: 'POST', body: JSON.stringify({ reason }), role })
}

export async function getAdminConfig(): Promise<AdminConfig> {
  const raw = await apiFetch<Record<string, unknown>>('/admin/config', { role })
  return {
    categories: (raw.categories as AdminConfig['categories']) ?? [],
    subscriptionPackages: (raw.subscriptionPackages as AdminConfig['subscriptionPackages']) ?? [],
    listingFees: (raw.listingFees as AdminConfig['listingFees']) ?? [],
    leadGenFees: (raw.leadGenFees as AdminConfig['leadGenFees']) ?? [],
    commissionRules: (raw.commissionRules as AdminConfig['commissionRules']) ?? [],
    cmsPages: (raw.cmsPages as AdminConfig['cmsPages']) ?? [],
    emailTemplates: (raw.emailTemplates as AdminConfig['emailTemplates']) ?? [],
    settings: (raw.settings as AdminConfig['settings']) ?? {
      platformName: 'MediaConnect UAE',
      supportEmail: 'support@mediaconnect.ae',
      defaultCity: 'Dubai',
      maintenanceMode: false,
    },
  }
}

export async function saveAdminConfig(config: AdminConfig) {
  await apiFetch('/admin/config', { method: 'PUT', body: JSON.stringify(config), role })
}

export async function sendBroadcastNotification(target: 'advertisers' | 'owners' | 'all', title: string, body: string, link?: string) {
  await apiFetch('/admin/notifications/broadcast', {
    method: 'POST',
    body: JSON.stringify({ target, title, body, link }),
    role,
  })
}

export async function getAuditLog(): Promise<AdminAuditEntry[]> {
  return apiFetch<AdminAuditEntry[]>('/admin/audit-log', { role })
}

export function getAgencyProfileById(id: string) {
  return apiFetch<Record<string, unknown>>(`/public/agencies/${id}`, { auth: false })
}
