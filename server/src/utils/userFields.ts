import { pickFields } from './pickFields.js'

export const USER_PROFILE_FIELDS = [
  'fullName',
  'phone',
  'companyName',
  'jobTitle',
  'industry',
  'avatarUrl',
  'defaultCity',
  'emailNotifications',
  'quoteAlerts',
  'marketingConsent',
] as const

export const ADMIN_USER_PATCH_FIELDS = [
  'fullName',
  'phone',
  'companyName',
  'defaultCity',
  'emailNotifications',
  'quoteAlerts',
  'subscription',
] as const

export const ADMIN_CONFIG_FIELDS = [
  'categories',
  'subscriptionPackages',
  'listingFees',
  'leadGenFees',
  'commissionRules',
  'cmsPages',
  'emailTemplates',
  'heroImagesByEmirate',
  'howItWorks',
  'settings',
] as const

export const PRICING_MODEL_FIELDS = [
  'listingFees',
  'leadGenFees',
  'commission',
  'canViewAdvertiserContact',
  'contactRevealLimit',
] as const

export const SUBCATEGORY_PATCH_FIELDS = ['name', 'active', 'sortOrder', 'categoryId'] as const

export function pickUserProfile(body: Record<string, unknown>) {
  return pickFields(body, USER_PROFILE_FIELDS)
}

export function pickAdminUserPatch(body: Record<string, unknown>) {
  return pickFields(body, ADMIN_USER_PATCH_FIELDS)
}

export function pickAdminConfig(body: Record<string, unknown>) {
  return pickFields(body, ADMIN_CONFIG_FIELDS)
}

export function pickPricingModel(body: Record<string, unknown>) {
  return pickFields(body, PRICING_MODEL_FIELDS)
}

export function pickSubcategoryPatch(body: Record<string, unknown>) {
  return pickFields(body, SUBCATEGORY_PATCH_FIELDS)
}
