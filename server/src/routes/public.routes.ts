import { Router } from 'express'
import { Agency } from '../models/Agency.js'
import { Listing } from '../models/Listing.js'
import { AdminConfig } from '../models/AdminConfig.js'
import { listingToDetail, listingToPublic } from '../services/serializers.js'

export const publicRouter = Router()

publicRouter.get('/listings', async (req, res) => {
  const { mediaType, city, search } = req.query as Record<string, string>
  const filter: Record<string, unknown> = { status: 'approved' }
  if (mediaType && mediaType !== 'all') filter.mediaType = mediaType
  if (city && city !== 'All UAE' && city !== 'all') filter.city = city
  let listings = await Listing.find(filter).sort({ createdAt: -1 }).lean()
  if (search) {
    const q = search.toLowerCase()
    listings = listings.filter(
      (l) => l.title.toLowerCase().includes(q) || l.agencyName.toLowerCase().includes(q),
    )
  }
  res.json(listings.map((l) => listingToPublic(l as never)))
})

publicRouter.get('/listings/:id', async (req, res) => {
  const l = await Listing.findOne({ listingId: req.params.id, status: 'approved' }).lean()
  if (!l) return res.status(404).json({ error: 'Listing not found' })
  const agency = await Agency.findOne({ agencyId: l.agencyId, status: 'approved' }).lean()
  res.json({
    ...listingToDetail(l as never),
    agency: agency
      ? {
          id: agency.agencyId,
          name: agency.name,
          initials: agency.initials,
          color: agency.color,
          verified: agency.verified,
          mediaTypes: agency.mediaTypes,
        }
      : {
          id: l.agencyId,
          name: l.agencyName,
          initials: l.agencyName?.slice(0, 2) ?? 'MC',
          color: '#0f172a',
          verified: false,
          mediaTypes: [l.mediaType],
        },
  })
})

publicRouter.get('/agencies', async (req, res) => {
  const featured = req.query.featured === 'true'
  const filter: Record<string, unknown> = { status: 'approved' }
  if (featured) filter.featured = true
  const agencies = await Agency.find(filter).sort({ createdAt: -1 }).lean()
  res.json(
    agencies.map((a) => ({
      id: a.agencyId,
      name: a.name,
      initials: a.initials,
      color: a.color,
      about: a.about,
      rating: a.rating,
      reviewCount: a.reviewCount,
      priceFrom: a.pricingPlans?.[0]?.priceFrom ?? 0,
      listingCount: 0,
      mediaTypes: a.mediaTypes,
      headquarters: a.city,
      responseHours: a.responseHours,
      verified: a.verified,
      city: a.city,
      lat: a.lat,
      lng: a.lng,
      coverImage: a.coverImage,
      gallery: a.gallery,
      services: a.services,
      pricingPlans: a.pricingPlans,
      deliverables: a.deliverables,
      address: a.address,
      reviews: a.reviews,
    })),
  )
})

publicRouter.get('/agencies/:id', async (req, res) => {
  const a = await Agency.findOne({ agencyId: req.params.id, status: 'approved' }).lean()
  if (!a) return res.status(404).json({ error: 'Agency not found' })
  res.json({
    id: a.agencyId,
    name: a.name,
    initials: a.initials,
    color: a.color,
    coverImage: a.coverImage,
    logoUrl: a.logoUrl,
    gallery: a.gallery,
    about: a.about,
    rating: a.rating,
    reviewCount: a.reviewCount,
    city: a.city,
    lat: a.lat,
    lng: a.lng,
    address: a.address,
    mediaTypes: a.mediaTypes,
    services: a.services,
    pricingPlans: a.pricingPlans,
    deliverables: a.deliverables,
    responseHours: a.responseHours,
    verified: a.verified,
    reviews: a.reviews,
    contactEmail: a.businessEmail,
    contactPhone: a.phone,
  })
})

publicRouter.get('/categories', async (_req, res) => {
  const config = await AdminConfig.findOne({ key: 'platform' }).lean()
  res.json(config?.categories?.filter((c: { active: boolean }) => c.active) ?? [])
})

publicRouter.get('/packages', async (_req, res) => {
  const config = await AdminConfig.findOne({ key: 'platform' }).lean()
  res.json(config?.subscriptionPackages?.filter((p: { active: boolean }) => p.active) ?? [])
})
