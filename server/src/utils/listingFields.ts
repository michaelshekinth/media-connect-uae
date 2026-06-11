import { pickFields } from './pickFields.js'

/** Fields a publisher may set when creating or updating a listing. */
export const LISTING_EDITABLE_FIELDS = [
  'title',
  'mediaCategory',
  'mediaType',
  'subcategory',
  'subcategoryId',
  'emirate',
  'city',
  'area',
  'landmark',
  'sizeWidth',
  'sizeHeight',
  'sizeUnit',
  'pricingType',
  'priceMin',
  'priceMax',
  'billingDuration',
  'customDurationLabel',
  'oohType',
  'mediaTypeDetail',
  'objectives',
  'assetOwnership',
  'aboutPlacement',
  'availability',
  'descriptionShort',
  'descriptionLong',
  'imageUrl',
  'galleryImages',
  'deliverables',
  'isDirectMedia',
  'lat',
  'lng',
  'documents',
  'format',
] as const

const CREATE_ALLOWED_STATUS = new Set(['draft', 'pending_approval'])

export function pickListingFields(body: Record<string, unknown>) {
  return pickFields(body, LISTING_EDITABLE_FIELDS)
}

export function resolveCreateListingStatus(requested: unknown): 'draft' | 'pending_approval' {
  const s = typeof requested === 'string' ? requested : 'draft'
  return CREATE_ALLOWED_STATUS.has(s) ? (s as 'draft' | 'pending_approval') : 'draft'
}
