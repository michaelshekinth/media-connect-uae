import type { OwnerCompanyProfile, OwnerListing, UploadedDocument } from '@shared/types/owner'
import { findDocument } from '@shared/utils/fileUpload'

export function syncLicenseFromDocuments(profile: OwnerCompanyProfile): OwnerCompanyProfile {
  const tradeLicense = findDocument(profile.documents, 'trade_license')
  return {
    ...profile,
    licenseDocument: tradeLicense?.data ?? profile.licenseDocument,
    licenseDocumentName: tradeLicense?.fileName ?? profile.licenseDocumentName,
    logoUrl: findDocument(profile.documents, 'company_logo')?.data ?? profile.logoUrl,
  }
}

export function hasRequiredCompanyDocuments(documents: UploadedDocument[]) {
  return !!findDocument(documents, 'trade_license')
}

export function heroImageFromDocuments(documents: UploadedDocument[], fallback: string) {
  return findDocument(documents, 'hero_image')?.data ?? fallback
}

export function galleryFromDocuments(documents: UploadedDocument[]) {
  return documents.filter((d) => d.type === 'gallery_image').map((d) => d.data)
}

export function documentsFromListing(listing: OwnerListing): UploadedDocument[] {
  if (listing.documents?.length) return listing.documents
  const docs: UploadedDocument[] = []
  const now = new Date().toISOString()
  if (listing.imageUrl) {
    docs.push({
      id: 'hero_existing',
      type: 'hero_image',
      label: 'Hero image',
      fileName: 'hero.jpg',
      mimeType: 'image/jpeg',
      data: listing.imageUrl,
      uploadedAt: now,
    })
  }
  listing.galleryImages?.forEach((url, i) => {
    docs.push({
      id: `gallery_existing_${i}`,
      type: 'gallery_image',
      label: `Gallery ${i + 1}`,
      fileName: `gallery-${i + 1}.jpg`,
      mimeType: 'image/jpeg',
      data: url,
      uploadedAt: now,
    })
  })
  return docs
}
