import type { MediaCategory, MediaType } from './categories'

export type OwnerApprovalStatus = 'draft' | 'submitted' | 'approved' | 'rejected'
export type ListingApprovalStatus =
  | 'draft'
  | 'pending_approval'
  | 'pending_edit_approval'
  | 'approved'
  | 'rejected'
  | 'archived'
export type CustomQuoteStatus = 'sent' | 'accepted' | 'declined'
export type OwnerMediaCategory = MediaCategory
export type PricingType = 'fixed' | 'range' | 'starting_price' | 'on_request'
export type BillingDuration = 'per_day' | 'per_week' | 'per_month' | 'per_campaign' | 'per_spot' | 'custom'
export type LeadStatus = 'connected' | 'quoted' | 'converted' | 'lost'
export type AssetOwnership = 'owned' | 'leased'

export type DocumentType =
  | 'trade_license'
  | 'vat_certificate'
  | 'signatory_id'
  | 'insurance'
  | 'company_logo'
  | 'media_kit'
  | 'rate_card'
  | 'site_map'
  | 'hero_image'
  | 'gallery_image'
  | 'campaign_brief'
  | 'proposal'
  | 'other'

export interface UploadedDocument {
  id: string
  type: DocumentType
  label: string
  fileName: string
  mimeType: string
  data: string
  uploadedAt: string
}

export type OwnerDashboardTab =
  | 'chats'
  | 'overview'
  | 'listings'
  | 'leads'
  | 'quotes-sent'
  | 'notifications'
  | 'company-profile'
  | 'purchases'

export type OwnerNotificationType =
  | 'new_lead'
  | 'new_message'
  | 'listing_approved'
  | 'listing_rejected'
  | 'listing_submitted'
  | 'profile_approved'
  | 'profile_rejected'
  | 'profile_submitted'
  | 'quote_accepted'
  | 'quote_sent'

export interface OwnerCompanyProfile {
  companyLegalName: string
  authorizedPerson: string
  jobTitle: string
  businessEmail: string
  phone: string
  city: string
  address: string
  website: string
  licenseNumber: string
  licenseExpiry: string
  licenseDocument: string | null
  licenseDocumentName: string
  vatTrn: string
  mediaCategories: MediaCategory[]
  companyDescription: string
  logoUrl: string | null
  documents: UploadedDocument[]
  rejectionReason?: string
}

export interface OwnerListing {
  id: string
  agencyId: string
  title: string
  mediaCategory: OwnerMediaCategory
  mediaType: MediaType
  subcategory: string
  subcategoryId?: string
  emirate: string
  city: string
  area: string
  landmark: string
  sizeWidth: string
  sizeHeight: string
  sizeUnit: string
  pricingType: PricingType
  priceMin: number
  priceMax: number
  billingDuration: BillingDuration
  customDurationLabel?: string
  oohType?: string
  mediaTypeDetail?: string
  objectives?: string[]
  aboutPlacement: string
  availability: 'immediate' | '1-2-weeks'
  descriptionShort: string
  descriptionLong: string
  assetOwnership?: AssetOwnership | null
  submissionType?: 'create' | 'edit'
  imageUrl: string
  galleryImages: string[]
  deliverables: string[]
  isDirectMedia: boolean
  lat: number
  lng: number
  status: ListingApprovalStatus
  rejectionReason?: string
  submittedAt?: string
  reviewedAt?: string
  createdAt: string
  documents: UploadedDocument[]
}

export interface InboundLead {
  id: string
  quoteRequestId: string
  agencyId: string
  advertiserId: string
  advertiserName: string
  advertiserEmail: string
  campaignName: string
  mediaType: MediaType
  budgetRange: string
  startDate: string
  endDate: string
  message: string
  listingId?: string
  status: LeadStatus
  contactViewedAt?: string
  convertedAmount?: number
  quotedAmount?: number
  createdAt: string
}

export interface OwnerChatMessage {
  id: string
  threadId: string
  sender: 'advertiser' | 'owner'
  text: string
  quoteCard?: { amount: number; description: string; quoteId: string }
  createdAt: string
}

export interface OwnerChatThread {
  id: string
  agencyId: string
  advertiserId: string
  advertiserName: string
  lastMessage: string
  unread: boolean
  messages: OwnerChatMessage[]
  updatedAt: string
}

export interface CustomQuote {
  id: string
  quoteRequestId: string
  threadId: string
  agencyId: string
  advertiserId: string
  advertiserName: string
  amountAed: number
  description: string
  attachmentName?: string
  attachmentData?: string
  status: CustomQuoteStatus
  createdAt: string
}

export interface OwnerNotification {
  id: string
  type: OwnerNotificationType
  title: string
  body: string
  read: boolean
  link?: string
  createdAt: string
}

export interface OwnerStats {
  activeListings: number
  leadsReceived: number
  quotesSent: number
  dealsWon: number
  leadsByDay: { date: string; count: number }[]
  quotesByStatus: { sent: number; accepted: number; declined: number }
  listingsByStatus: { pending: number; approved: number; rejected: number }
}
