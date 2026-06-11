import type { AdminConfig, AdminAuditEntry, AdvertiserSubscription } from '@shared/types/admin'
import type { LeadStatus, OwnerCompanyProfile, OwnerListing, InboundLead, CustomQuote, OwnerChatThread } from '@shared/types/owner'
import type { User, QuoteRequest } from '@shared/types/user'
import { apiFetch } from '@shared/services/apiClient'

const role = 'super_admin' as const

export interface AdminSubcategory {
  id: string
  categoryId: string
  name: string
  active: boolean
  sortOrder: number
}

export interface PublisherPricingModel {
  agencyId: string
  listingFees: { mode: string; amount: number; active: boolean }
  leadGenFees: { mode: string; amount: number; active: boolean }
  commission: { mode: string; rate: number; active: boolean }
  canViewAdvertiserContact: boolean
  contactRevealLimit: number
  contactRevealsUsed: number
}

export interface AgencyFeatured {
  featured: boolean
  featuredFrom: string | null
  featuredUntil: string | null
  featuredCities: string[]
}

export interface RevenueEntry {
  id: string
  agencyId: string
  modelType: 'listing_fees' | 'lead_gen' | 'commission'
  amount: number
  sourceId?: string | null
  status: 'pending' | 'collected'
  collectedAt?: string | null
  notes?: string
  createdAt?: string
}

export interface PermitAssistanceRequest {
  id: string
  campaignName: string
  advertiserName: string
  advertiserEmail: string
  agencyId: string
  status: LeadStatus
  message: string
  createdAt: string
}

export interface CreatePublisherPayload {
  email: string
  password: string
  companyName: string
  skipOnboarding?: boolean
}

export interface HowItWorksConfig {
  title: string
  steps: { title: string; description: string }[]
}

export type ExtendedAdminConfig = AdminConfig & {
  heroImagesByEmirate?: Record<string, string>
  howItWorks?: HowItWorksConfig
}

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

export async function getAdminConfig(): Promise<ExtendedAdminConfig> {
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
    heroImagesByEmirate: (raw.heroImagesByEmirate as Record<string, string>) ?? {},
    howItWorks: (raw.howItWorks as HowItWorksConfig) ?? { title: 'How it works', steps: [] },
  }
}

export async function saveAdminConfig(config: ExtendedAdminConfig) {
  await apiFetch('/admin/config', { method: 'PUT', body: JSON.stringify(config), role })
}

export async function getSubcategories(categoryId?: string) {
  const q = categoryId ? `?category=${encodeURIComponent(categoryId)}` : ''
  return apiFetch<AdminSubcategory[]>(`/admin/subcategories${q}`, { role })
}

export async function createSubcategory(data: { categoryId: string; name: string; sortOrder?: number }) {
  return apiFetch<AdminSubcategory>('/admin/subcategories', { method: 'POST', body: JSON.stringify(data), role })
}

export async function updateSubcategory(id: string, data: Partial<AdminSubcategory>) {
  return apiFetch<AdminSubcategory>(`/admin/subcategories/${id}`, { method: 'PATCH', body: JSON.stringify(data), role })
}

export async function deleteSubcategory(id: string) {
  await apiFetch(`/admin/subcategories/${id}`, { method: 'DELETE', role })
}

export async function createPublisher(data: CreatePublisherPayload) {
  return apiFetch<{ agencyId: string; userId: string; email: string }>('/admin/publishers', {
    method: 'POST',
    body: JSON.stringify(data),
    role,
  })
}

export async function getPublisherPricingModel(agencyId: string) {
  return apiFetch<PublisherPricingModel | null>(`/admin/publishers/${agencyId}/pricing-model`, { role })
}

export async function savePublisherPricingModel(agencyId: string, model: Partial<PublisherPricingModel>) {
  return apiFetch<PublisherPricingModel>(`/admin/publishers/${agencyId}/pricing-model`, {
    method: 'PUT',
    body: JSON.stringify(model),
    role,
  })
}

export async function updateAgencyFeatured(agencyId: string, data: Partial<AgencyFeatured>) {
  return apiFetch<AgencyFeatured & { agencyId: string }>(`/admin/agencies/${agencyId}/featured`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    role,
  })
}

export async function delistListing(agencyId: string, listingId: string) {
  await apiFetch(`/admin/listings/${agencyId}/${listingId}/delist`, { method: 'POST', role })
}

export async function getPendingEditListings() {
  return getAllListings({ status: 'pending_edit_approval' })
}

export async function getRevenueEntries(filters?: { agencyId?: string; status?: string }) {
  const params = new URLSearchParams()
  if (filters?.agencyId) params.set('agencyId', filters.agencyId)
  if (filters?.status) params.set('status', filters.status)
  const q = params.toString()
  return apiFetch<RevenueEntry[]>(`/admin/revenue${q ? `?${q}` : ''}`, { role })
}

export async function markRevenueCollected(id: string, notes?: string) {
  return apiFetch<RevenueEntry>(`/admin/revenue/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'collected', collectedAt: new Date().toISOString(), notes: notes ?? '' }),
    role,
  })
}

export async function getPermitAssistanceRequests() {
  return apiFetch<PermitAssistanceRequest[]>('/admin/permit-assistance', { role })
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
