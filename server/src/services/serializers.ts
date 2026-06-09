import type { UserDoc } from '../models/User.js'

export function serializeUser(u: UserDoc) {
  return {
    id: u._id.toString(),
    email: u.email,
    fullName: u.fullName,
    phone: u.phone,
    companyName: u.companyName,
    jobTitle: u.jobTitle,
    avatarUrl: u.avatarUrl,
    defaultCity: u.defaultCity,
    emailNotifications: u.emailNotifications,
    quoteAlerts: u.quoteAlerts,
    createdAt: u.createdAt.toISOString(),
    role: u.role,
    agencyId: u.agencyId ?? undefined,
    ownerProfileComplete: u.ownerProfileComplete ?? undefined,
    ownerApprovalStatus: u.ownerApprovalStatus ?? undefined,
    favorites: u.favorites,
    recentlyViewed: u.recentlyViewed,
    subscription: u.subscription ?? null,
  }
}

type ListingDoc = {
  listingId: string
  title: string
  mediaType: string
  mediaCategory?: string
  subcategory?: string
  city: string
  area?: string
  landmark?: string
  sizeWidth?: string
  sizeHeight?: string
  sizeUnit?: string
  priceMin: number
  priceMax: number
  pricingType?: string
  billingDuration?: string
  imageUrl: string
  agencyId: string
  agencyName: string
  lat: number
  lng: number
  availability: string
  format?: string
  rating?: number
  isDirectMedia: boolean
  descriptionShort: string
  descriptionLong?: string
  galleryImages: string[]
  deliverables?: string[]
  createdAt?: Date
}

export function listingToPublic(l: ListingDoc) {
  return {
    id: l.listingId,
    title: l.title,
    mediaType: l.mediaType,
    city: l.city,
    budgetMin: l.priceMin,
    budgetMax: l.priceMax,
    imageUrl: l.imageUrl,
    agencyId: l.agencyId,
    agencyName: l.agencyName,
    lat: l.lat,
    lng: l.lng,
    availability: l.availability,
    format: l.format ?? 'billboard',
    rating: l.rating ?? 4.5,
    isDirectMedia: l.isDirectMedia,
    descriptionShort: l.descriptionShort,
    galleryImages: l.galleryImages,
    createdAt: l.createdAt?.toISOString() ?? new Date().toISOString(),
  }
}

export function listingToDetail(l: ListingDoc) {
  return {
    ...listingToPublic(l),
    subcategory: l.subcategory ?? '',
    mediaCategory: l.mediaCategory ?? l.mediaType,
    area: l.area ?? '',
    landmark: l.landmark ?? '',
    sizeWidth: l.sizeWidth ?? '',
    sizeHeight: l.sizeHeight ?? '',
    sizeUnit: l.sizeUnit ?? 'm',
    pricingType: l.pricingType ?? 'range',
    billingDuration: l.billingDuration ?? 'per_month',
    descriptionLong: l.descriptionLong ?? l.descriptionShort ?? '',
    deliverables: l.deliverables ?? [],
  }
}
