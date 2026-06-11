import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'
import { User } from '../models/User.js'
import { Agency } from '../models/Agency.js'
import { OwnerProfile } from '../models/OwnerProfile.js'
import { PublisherPricingModel } from '../models/PublisherPricingModel.js'
import { RevenueEntry } from '../models/RevenueEntry.js'
import { QuoteRequest } from '../models/QuoteRequest.js'
import { Listing } from '../models/Listing.js'
import { PurchaseRequest } from '../models/PurchaseRequest.js'
import { newId } from '../utils/id.js'
import { param } from '../utils/params.js'
import { recordRevenueEntry } from '../services/revenueService.js'
import { normalizeLeadStatus } from '../utils/quoteStatus.js'
import { pickPricingModel } from '../utils/userFields.js'
import { ensureContactRevealPeriod, tryIncrementContactReveal } from '../utils/contactReveal.js'

export const adminCommercialRouter = Router()
adminCommercialRouter.use(requireAuth, requireRole('super_admin'))

adminCommercialRouter.get('/publishers/:agencyId/pricing-model', async (req, res) => {
  const model = await PublisherPricingModel.findOne({ agencyId: req.params.agencyId })
  res.json(model ?? null)
})

adminCommercialRouter.put('/publishers/:agencyId/pricing-model', async (req, res) => {
  const updates = pickPricingModel(req.body as Record<string, unknown>)
  const model = await PublisherPricingModel.findOneAndUpdate(
    { agencyId: req.params.agencyId },
    { $set: updates },
    { upsert: true, new: true },
  )
  res.json(model)
})

adminCommercialRouter.get('/revenue', async (req, res) => {
  const filter: Record<string, unknown> = {}
  if (req.query.agencyId) filter.agencyId = req.query.agencyId
  if (req.query.status) filter.status = req.query.status
  const entries = await RevenueEntry.find(filter).sort({ createdAt: -1 })
  res.json(entries.map((e) => ({ ...e.toObject(), id: e.entryId })))
})

adminCommercialRouter.patch('/revenue/:id', async (req, res) => {
  const { status, notes, collectedAt } = req.body as {
    status?: string
    notes?: string
    collectedAt?: string
  }
  const updates: Record<string, unknown> = {}
  if (status) updates.status = status
  if (notes !== undefined) updates.notes = notes
  if (collectedAt) updates.collectedAt = collectedAt
  const entry = await RevenueEntry.findOneAndUpdate({ entryId: req.params.id }, { $set: updates }, { new: true })
  if (!entry) return res.status(404).json({ error: 'Not found' })
  res.json({ ...entry.toObject(), id: entry.entryId })
})

adminCommercialRouter.post('/publishers', async (req, res) => {
  const body = req.body as {
    email: string
    password: string
    companyName: string
    skipOnboarding?: boolean
    profile?: Record<string, unknown>
  }
  if (!body.email || !body.password || !body.companyName) {
    return res.status(400).json({ error: 'email, password, companyName required' })
  }
  if (body.password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }
  const exists = await User.findOne({ email: body.email.toLowerCase() })
  if (exists) return res.status(409).json({ error: 'Email already registered' })

  const agencyId = newId('agency_')
  const user = await User.create({
    email: body.email.toLowerCase(),
    passwordHash: await bcrypt.hash(body.password, 10),
    fullName: body.companyName,
    companyName: body.companyName,
    role: 'media_owner',
    agencyId,
    ownerProfileComplete: !!body.skipOnboarding,
    ownerApprovalStatus: body.skipOnboarding ? 'approved' : 'draft',
  })

  await Agency.create({
    agencyId,
    name: body.companyName,
    initials: body.companyName.slice(0, 2).toUpperCase(),
    color: '#0f172a',
    status: body.skipOnboarding ? 'approved' : 'pending',
    mediaTypes: [],
    city: 'Dubai',
  })

  if (body.profile) {
    await OwnerProfile.findOneAndUpdate(
      { agencyId },
      { $set: { ...body.profile, agencyId, userId: user._id.toString() } },
      { upsert: true },
    )
  }

  await PublisherPricingModel.create({ agencyId })
  res.status(201).json({ agencyId, userId: user._id.toString(), email: user.email })
})

adminCommercialRouter.post('/listings/:agencyId/:listingId/delist', async (req, res) => {
  const result = await Listing.updateOne(
    { listingId: req.params.listingId, agencyId: req.params.agencyId },
    { status: 'archived', delistedAt: new Date().toISOString() },
  )
  if (result.matchedCount === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ ok: true })
})

adminCommercialRouter.get('/permit-assistance', async (_req, res) => {
  const quotes = await QuoteRequest.find({ permitAssistance: true }).sort({ createdAt: -1 })
  res.json(quotes.map((q) => ({ ...q.toObject(), id: q.quoteId, status: normalizeLeadStatus(q.status) })))
})

adminCommercialRouter.get('/purchase-requests', async (req, res) => {
  const filter: Record<string, unknown> = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.agencyId) filter.agencyId = req.query.agencyId
  const items = await PurchaseRequest.find(filter).sort({ createdAt: -1 })
  res.json(items.map((p) => ({ ...p.toObject(), id: p.requestId })))
})

adminCommercialRouter.patch('/purchase-requests/:id', async (req, res) => {
  const { status, adminNotes } = req.body as { status?: string; adminNotes?: string }
  const updates: Record<string, unknown> = {}
  if (status) updates.status = status
  if (adminNotes !== undefined) updates.adminNotes = adminNotes
  const item = await PurchaseRequest.findOneAndUpdate({ requestId: req.params.id }, { $set: updates }, { new: true })
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json({ ...item.toObject(), id: item.requestId })
})

adminCommercialRouter.patch('/agencies/:agencyId/featured', async (req, res) => {
  const { featured, featuredFrom, featuredUntil, featuredCities } = req.body as {
    featured?: boolean
    featuredFrom?: string
    featuredUntil?: string
    featuredCities?: string[]
  }
  const agency = await Agency.findOneAndUpdate(
    { agencyId: req.params.agencyId },
    { $set: { featured, featuredFrom, featuredUntil, featuredCities } },
    { new: true },
  )
  if (!agency) return res.status(404).json({ error: 'Not found' })
  res.json(agency)
})

export const ownerCommercialRouter = Router()
ownerCommercialRouter.use(requireAuth, requireRole('media_owner'))

function agencyId(req: AuthRequest) {
  return req.auth!.agencyId!
}

ownerCommercialRouter.get('/features', async (req: AuthRequest, res) => {
  const aid = agencyId(req)
  await ensureContactRevealPeriod(aid)
  const pricing = await PublisherPricingModel.findOne({ agencyId: aid })
  const agency = await Agency.findOne({ agencyId: aid })
  res.json({
    featured: agency?.featured ?? false,
    featuredFrom: agency?.featuredFrom ?? null,
    featuredUntil: agency?.featuredUntil ?? null,
    featuredCities: agency?.featuredCities ?? [],
    pricingModel: pricing
      ? {
          listingFees: pricing.listingFees,
          leadGenFees: pricing.leadGenFees,
          commission: pricing.commission,
        }
      : null,
    canViewAdvertiserContact: pricing?.canViewAdvertiserContact ?? false,
    contactRevealLimit: pricing?.contactRevealLimit ?? 0,
    contactRevealsUsed: pricing?.contactRevealsUsed ?? 0,
  })
})

ownerCommercialRouter.get('/purchases', async (req: AuthRequest, res) => {
  const items = await PurchaseRequest.find({ agencyId: agencyId(req) }).sort({ createdAt: -1 })
  res.json(items.map((p) => ({ ...p.toObject(), id: p.requestId })))
})

ownerCommercialRouter.post('/purchases', async (req: AuthRequest, res) => {
  const { packageId, notes } = req.body as { packageId?: string; notes?: string }
  const requestId = newId('purchase_')
  const item = await PurchaseRequest.create({
    requestId,
    agencyId: agencyId(req),
    packageId: packageId ?? '',
    notes: notes ?? '',
    status: 'pending_admin',
  })
  res.status(201).json({ ok: true, requestId: item.requestId, status: item.status })
})

ownerCommercialRouter.post('/reveal-advertiser/:quoteId', async (req: AuthRequest, res) => {
  const aid = agencyId(req)
  const pricing = await PublisherPricingModel.findOne({ agencyId: aid })
  if (!pricing?.canViewAdvertiserContact) {
    return res.status(403).json({ error: 'Contact reveal not enabled for your account' })
  }

  const quote = await QuoteRequest.findOne({ quoteId: param(req.params.quoteId), agencyId: aid })
  if (!quote) return res.status(404).json({ error: 'Lead not found' })

  if (quote.contactViewedAt) {
    return res.json({
      advertiserName: quote.advertiserName,
      advertiserEmail: quote.advertiserEmail,
      contactViewedAt: quote.contactViewedAt,
    })
  }

  await ensureContactRevealPeriod(aid)

  const claimed = await QuoteRequest.findOneAndUpdate(
    { quoteId: param(req.params.quoteId), agencyId: aid, contactViewedAt: null },
    { contactViewedAt: new Date().toISOString() },
    { new: true },
  )
  if (!claimed) {
    const existing = await QuoteRequest.findOne({ quoteId: param(req.params.quoteId), agencyId: aid })
    if (!existing) return res.status(404).json({ error: 'Lead not found' })
    return res.json({
      advertiserName: existing.advertiserName,
      advertiserEmail: existing.advertiserEmail,
      contactViewedAt: existing.contactViewedAt,
    })
  }

  if (pricing.contactRevealLimit > 0) {
    const allowed = await tryIncrementContactReveal(aid, pricing.contactRevealLimit)
    if (!allowed) {
      await QuoteRequest.updateOne(
        { quoteId: param(req.params.quoteId), agencyId: aid },
        { contactViewedAt: null },
      )
      return res.status(403).json({ error: 'Monthly contact reveal limit reached' })
    }
  }

  res.json({
    advertiserName: claimed.advertiserName,
    advertiserEmail: claimed.advertiserEmail,
    contactViewedAt: claimed.contactViewedAt,
  })
})
