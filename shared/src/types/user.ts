import type { MediaType, SearchFilters } from './index'
import type { OwnerApprovalStatus } from './owner'

export type UserRole = 'advertiser' | 'media_owner'

export interface User {
  id: string
  email: string
  password: string
  fullName: string
  phone: string
  companyName: string
  jobTitle: string
  avatarUrl: string | null
  defaultCity: string
  emailNotifications: boolean
  quoteAlerts: boolean
  createdAt: string
  role: UserRole
  agencyId?: string
  ownerProfileComplete?: boolean
  ownerApprovalStatus?: OwnerApprovalStatus
}

export type QuoteStatus = 'pending' | 'responded' | 'accepted' | 'declined'

export interface QuoteRequest {
  id: string
  agencyId: string
  agencyName: string
  advertiserId?: string
  advertiserName?: string
  listingId?: string
  campaignName: string
  mediaType: MediaType
  budgetRange: string
  startDate: string
  endDate: string
  message: string
  objectives?: string
  emirate?: string
  permitAssistance?: boolean
  status: QuoteStatus
  quotedAmount?: number
  quotedDescription?: string
  customQuoteId?: string
  createdAt: string
}

export interface ChatMessage {
  id: string
  threadId: string
  sender: 'user' | 'agency'
  text: string
  quoteCard?: { amount: number; description: string; quoteId: string }
  createdAt: string
}

export interface ChatThread {
  id: string
  agencyId: string
  agencyName: string
  agencyColor: string
  lastMessage: string
  unread: boolean
  messages: ChatMessage[]
  updatedAt: string
}

export interface SearchHistoryEntry {
  id: string
  filters: SearchFilters
  resultCount: number
  createdAt: string
}

export type ActivityType =
  | 'quote_sent'
  | 'quote_responded'
  | 'listing_saved'
  | 'agency_saved'
  | 'search'
  | 'profile_updated'
  | 'login'
  | 'quote_accepted'
  | 'quote_declined'
  | 'new_message'

export interface AppNotification {
  id: string
  type: 'quote_responded' | 'new_message' | 'quote_accepted'
  title: string
  body: string
  read: boolean
  link?: string
  createdAt: string
}

export interface ActivityEvent {
  id: string
  type: ActivityType
  title: string
  description: string
  createdAt: string
}

export interface Favorites {
  agencyIds: string[]
  listingIds: string[]
}

export interface PricingPlan {
  id: string
  name: string
  priceFrom: number
  priceTo: number
  features: string[]
  popular?: boolean
}

export interface AgencyReview {
  id: string
  author: string
  rating: number
  text: string
  date: string
}

export interface AgencyProfile {
  id: string
  name: string
  initials: string
  color: string
  coverImage: string
  logoUrl: string | null
  gallery: string[]
  about: string
  rating: number
  reviewCount: number
  city: string
  lat: number
  lng: number
  address: string
  mediaTypes: MediaType[]
  services: string[]
  pricingPlans: PricingPlan[]
  deliverables: string[]
  responseHours: number
  verified: boolean
  reviews: AgencyReview[]
}

export type BrowseCategory = 'all' | 'direct' | MediaType

export type DashboardTab =
  | 'activity'
  | 'search-history'
  | 'chats'
  | 'quotes'
  | 'favourites'
