import { Router } from 'express'
import { Agency } from '../models/Agency.js'
import { Listing } from '../models/Listing.js'
import { AdminConfig } from '../models/AdminConfig.js'
import { listingToDetail, listingToPublic } from '../services/serializers.js'
import { isFeaturedActive, matchesFeaturedCity } from '../utils/featured.js'

export const publicRouter = Router()

const LISTINGS_PAGE_SIZE = 100

publicRouter.get('/listings', async (req, res) => {
  const { mediaType, city, search, subcategory } = req.query as Record<string, string>
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1)
  const filter: Record<string, unknown> = { status: 'approved' }
  if (mediaType && mediaType !== 'all') filter.mediaType = mediaType
  if (subcategory && subcategory !== 'all') filter.subcategory = subcategory
  if (city && city !== 'All UAE' && city !== 'all') {
    filter.$or = [{ city }, { emirate: city }]
  }
  if (search?.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(escaped, 'i')
    filter.$and = [
      ...(Array.isArray(filter.$and) ? filter.$and : []),
      { $or: [{ title: regex }, { agencyName: regex }] },
    ]
  }

  const skip = (page - 1) * LISTINGS_PAGE_SIZE
  const [listings, total] = await Promise.all([
    Listing.find(filter).sort({ createdAt: -1 }).skip(skip).limit(LISTINGS_PAGE_SIZE).lean(),
    Listing.countDocuments(filter),
  ])

  res.json({
    items: listings.map((l) => listingToPublic(l as never)),
    page,
    pageSize: LISTINGS_PAGE_SIZE,
    total,
    hasMore: skip + listings.length < total,
  })
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
  const city = req.query.city as string | undefined
  const filter: Record<string, unknown> = { status: 'approved' }
  if (featured) filter.featured = true
  let agencies = await Agency.find(filter).sort({ createdAt: -1 }).lean()
  if (featured) {
    agencies = agencies.filter((a) => isFeaturedActive(a) && matchesFeaturedCity(a, city ?? ''))
  }
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
      featured: isFeaturedActive(a),
      avgResponseHours: a.avgResponseHours ?? a.responseHours,
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
    avgResponseHours: a.avgResponseHours ?? a.responseHours,
    verified: a.verified,
    featured: isFeaturedActive(a),
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

publicRouter.get('/cms', async (_req, res) => {
  const config = await AdminConfig.findOne({ key: 'platform' }).lean()
  res.json({
    heroImagesByEmirate: config?.heroImagesByEmirate ?? {},
    howItWorks: config?.howItWorks ?? [],
  })
})
