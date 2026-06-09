import type { MediaType } from './index'

export interface AdminSubscriptionPackage {
  id: string
  name: string
  priceAed: number
  durationDays: number
  contactViewsIncluded: number
  features: string[]
  active: boolean
}

export type ListingFeeBilling = 'free' | 'monthly' | 'annual' | 'per_listing'

export interface ListingFeeRule {
  id: string
  scope: 'global' | 'owner'
  ownerId?: string
  billing: ListingFeeBilling
  amountAed: number
  active: boolean
}

export type LeadGenFeeScope = 'global' | 'rfq' | 'category' | 'city' | 'owner' | 'custom'

export interface LeadGenFeeRule {
  id: string
  scope: LeadGenFeeScope
  amountAed: number
  active: boolean
  meta?: { label?: string; category?: string; city?: string; ownerId?: string }
}

export type CommissionScope = 'global' | 'category' | 'custom'

export interface CommissionRule {
  id: string
  scope: CommissionScope
  percent: number
  active: boolean
  meta?: { label?: string; category?: string }
}

export interface CategoryConfig {
  id: string
  label: string
  mediaType: MediaType
  active: boolean
  sortOrder: number
}

export interface CmsPage {
  slug: string
  title: string
  body: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  active: boolean
}

export interface AdminSettings {
  platformName: string
  supportEmail: string
  defaultCity: string
  maintenanceMode: boolean
}

export interface AdminConfig {
  categories: CategoryConfig[]
  subscriptionPackages: AdminSubscriptionPackage[]
  listingFees: ListingFeeRule[]
  leadGenFees: LeadGenFeeRule[]
  commissionRules: CommissionRule[]
  cmsPages: CmsPage[]
  emailTemplates: EmailTemplate[]
  settings: AdminSettings
}

export interface AdminAuditEntry {
  id: string
  action: string
  entity: string
  entityId?: string
  detail?: string
  adminEmail: string
  createdAt: string
}

export interface AdvertiserSubscription {
  packageId: string
  packageName: string
  startedAt: string
  expiresAt: string
  contactViewsRemaining: number
  revealedAgencyIds?: string[]
}

export interface AdminUser {
  email: string
  password: string
  name: string
}

export interface DevStoreBlob {
  kv: Record<string, string>
  adminAuditLog: AdminAuditEntry[]
}
