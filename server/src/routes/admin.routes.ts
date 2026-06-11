import { Router } from 'express'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'
import { User } from '../models/User.js'
import { OwnerProfile } from '../models/OwnerProfile.js'
import { Listing } from '../models/Listing.js'
import { Agency } from '../models/Agency.js'
import { QuoteRequest } from '../models/QuoteRequest.js'
import { CustomQuote } from '../models/CustomQuote.js'
import { ChatThread } from '../models/Chat.js'
import { AdminConfig } from '../models/AdminConfig.js'
import { AuditLog } from '../models/AuditLog.js'
import { Notification } from '../models/Notification.js'
import { newId } from '../utils/id.js'
import { maskContactInfo } from '../utils/contact.js'
import { serializeUser } from '../services/serializers.js'
import { param } from '../utils/params.js'
import { queueEmail } from '../services/emailService.js'
import { normalizeLeadStatus } from '../utils/quoteStatus.js'
import { pickAdminConfig, pickAdminUserPatch } from '../utils/userFields.js'

export const adminRouter = Router()
adminRouter.use(requireAuth, requireRole('super_admin'))

async function audit(adminEmail: string, action: string, entity: string, entityId?: string, detail?: string) {
  await AuditLog.create({ auditId: newId('audit_'), action, entity, entityId, detail, adminEmail })
}

adminRouter.get('/dashboard', async (_req, res) => {
  const users = await User.find()
  const pendingProfiles = users.filter((u) => u.role === 'media_owner' && u.ownerApprovalStatus === 'submitted').length
  const approvedOwners = users.filter((u) => u.role === 'media_owner' && u.ownerApprovalStatus === 'approved').length
  const pendingListings = await Listing.countDocuments({ status: 'pending_approval' })
  const totalRFQs = await QuoteRequest.countDocuments()
  const totalChats = await ChatThread.countDocuments()
  res.json({
    pendingProfiles,
    pendingListings,
    totalAdvertisers: users.filter((u) => u.role === 'advertiser').length,
    approvedOwners,
    totalMediaOwners: users.filter((u) => u.role === 'media_owner').length,
    totalRFQs,
    totalChats,
    totalUsers: users.length,
  })
})

adminRouter.get('/users', async (_req, res) => {
  const users = await User.find({ role: 'advertiser' })
  res.json(users.map((u) => ({ ...serializeUser(u), quotesCount: 0, subscription: u.subscription })))
})

adminRouter.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ error: 'Not found' })
  const quotes = await QuoteRequest.find({ advertiserId: req.params.id })
  res.json({ user: serializeUser(user), data: { quotes, subscription: user.subscription } })
})

adminRouter.patch('/users/:id', async (req, res) => {
  const updates = pickAdminUserPatch(req.body as Record<string, unknown>)
  const user = await User.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true })
  if (!user) return res.status(404).json({ error: 'Not found' })
  res.json(serializeUser(user))
})

adminRouter.get('/media-owners', async (req, res) => {
  const status = req.query.status as string | undefined
  let filter: Record<string, unknown> = { role: 'media_owner' }
  if (status === 'pending') filter = { ...filter, ownerApprovalStatus: 'submitted' }
  if (status === 'approved') filter = { ...filter, ownerApprovalStatus: 'approved' }
  if (status === 'rejected') filter = { ...filter, ownerApprovalStatus: 'rejected' }
  const owners = await User.find(filter)
  const result = await Promise.all(
    owners.map(async (u) => {
      const profile = await OwnerProfile.findOne({ agencyId: u.agencyId })
      const listingsCount = await Listing.countDocuments({ agencyId: u.agencyId })
      const liveListings = await Listing.countDocuments({ agencyId: u.agencyId, status: 'approved' })
      return { ...serializeUser(u), companyProfile: profile, listingsCount, liveListings }
    }),
  )
  res.json(result)
})

adminRouter.get('/media-owners/:agencyId', async (req, res) => {
  const user = await User.findOne({ agencyId: req.params.agencyId })
  if (!user) return res.status(404).json({ error: 'Not found' })
  const profile = await OwnerProfile.findOne({ agencyId: req.params.agencyId })
  const listings = await Listing.find({ agencyId: req.params.agencyId })
  const leads = await QuoteRequest.find({ agencyId: req.params.agencyId })
  const chats = await ChatThread.find({ agencyId: req.params.agencyId })
  const customQuotes = await CustomQuote.find({ agencyId: req.params.agencyId })
  res.json({ user: serializeUser(user), data: { companyProfile: profile, listings, leads, chats, customQuotes } })
})

adminRouter.get('/pending-profiles', async (_req, res) => {
  const owners = await User.find({ role: 'media_owner', ownerApprovalStatus: 'submitted' })
  res.json(owners.map((u) => ({ agencyId: u.agencyId, companyName: u.companyName ?? 'Unknown', user: serializeUser(u) })))
})

adminRouter.post('/approve-profile/:agencyId', async (req: AuthRequest, res) => {
  const user = await User.findOne({ agencyId: req.params.agencyId })
  if (!user) return res.status(404).json({ error: 'Not found' })
  const profile = await OwnerProfile.findOne({ agencyId: req.params.agencyId })
  user.ownerApprovalStatus = 'approved'
  await user.save()
  if (profile) {
    const initials = profile.companyLegalName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    await Agency.findOneAndUpdate(
      { agencyId: req.params.agencyId },
      {
        agencyId: req.params.agencyId,
        ownerUserId: user._id.toString(),
        name: profile.companyLegalName,
        initials,
        about: profile.companyDescription,
        city: profile.city,
        address: profile.address,
        mediaTypes: profile.mediaCategories,
        businessEmail: profile.businessEmail,
        phone: profile.phone,
        verified: true,
        status: 'approved',
        featured: true,
      },
      { upsert: true },
    )
  }
  await Notification.create({
    notificationId: newId('n_'),
    userId: req.params.agencyId,
    role: 'media_owner',
    type: 'profile_approved',
    title: 'Profile approved',
    body: 'Your company profile has been approved. You can now create listings.',
    link: '/owner/dashboard/listings',
  })
  await audit(req.auth!.email, 'approve', 'profile', param(req.params.agencyId))
  res.json({ ok: true })
})

adminRouter.post('/reject-profile/:agencyId', async (req: AuthRequest, res) => {
  const { reason } = req.body as { reason?: string }
  await User.updateOne({ agencyId: req.params.agencyId }, { ownerApprovalStatus: 'rejected' })
  await OwnerProfile.updateOne({ agencyId: req.params.agencyId }, { rejectionReason: reason })
  await audit(req.auth!.email, 'reject', 'profile', param(req.params.agencyId), reason)
  res.json({ ok: true })
})

adminRouter.get('/listings', async (req, res) => {
  const filter: Record<string, unknown> = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.agencyId) filter.agencyId = req.query.agencyId
  const listings = await Listing.find(filter).sort({ createdAt: -1 })
  const users = await User.find({ role: 'media_owner' })
  const nameMap = Object.fromEntries(users.map((u) => [u.agencyId, u.companyName]))
  res.json(listings.map((l) => ({ listing: { ...l.toObject(), id: l.listingId }, agencyId: l.agencyId, companyName: nameMap[l.agencyId] ?? l.agencyId })))
})

adminRouter.post('/approve-listing/:agencyId/:listingId', async (req: AuthRequest, res) => {
  await Listing.updateOne(
    { listingId: req.params.listingId, agencyId: req.params.agencyId },
    { status: 'approved', reviewedAt: new Date().toISOString(), submissionType: 'create' },
  )
  await audit(req.auth!.email, 'approve', 'listing', param(req.params.listingId))
  const owner = await User.findOne({ agencyId: req.params.agencyId, role: 'media_owner' })
  if (owner?.email) {
    const ownerUrl = process.env.MEDIA_OWNER_URL ?? 'https://media-owner.vercel.app'
    await queueEmail({
      templateId: 'listing_approved',
      to: owner.email,
      subject: 'Listing approved',
      body: `Your listing was approved.\n\nView: ${ownerUrl}/owner/dashboard/listings`,
    })
  }
  res.json({ ok: true })
})

adminRouter.post('/reject-listing/:agencyId/:listingId', async (req: AuthRequest, res) => {
  const { reason } = req.body as { reason?: string }
  await Listing.updateOne(
    { listingId: req.params.listingId, agencyId: req.params.agencyId },
    { status: 'rejected', rejectionReason: reason, reviewedAt: new Date().toISOString() },
  )
  await audit(req.auth!.email, 'reject', 'listing', param(req.params.listingId), reason)
  const owner = await User.findOne({ agencyId: req.params.agencyId, role: 'media_owner' })
  if (owner?.email) {
    await queueEmail({
      templateId: 'listing_rejected',
      to: owner.email,
      subject: 'Listing needs changes',
      body: `Your listing was not approved.\n\nReason: ${reason ?? 'See admin notes'}`,
    })
  }
  res.json({ ok: true })
})

adminRouter.get('/rfqs', async (_req, res) => {
  const rfqs = await QuoteRequest.find().sort({ createdAt: -1 })
  const owners = await User.find({ role: 'media_owner' })
  const nameMap = Object.fromEntries(owners.map((u) => [u.agencyId, u.companyName]))
  res.json(
    rfqs.map((r) => ({
      ...r.toObject(),
      id: r.quoteId,
      ownerName: nameMap[r.agencyId] ?? r.agencyId,
      status: normalizeLeadStatus(r.status),
    })),
  )
})

adminRouter.get('/quotes', async (_req, res) => {
  const quotes = await CustomQuote.find().sort({ createdAt: -1 })
  const owners = await User.find({ role: 'media_owner' })
  const nameMap = Object.fromEntries(owners.map((u) => [u.agencyId, u.companyName]))
  res.json(quotes.map((q) => ({ ...q.toObject(), id: q.customQuoteId, ownerName: nameMap[q.agencyId] ?? q.agencyId })))
})

adminRouter.get('/chats', async (_req, res) => {
  const threads = await ChatThread.find().sort({ updatedAt: -1 })
  const owners = await User.find({ role: 'media_owner' })
  const nameMap = Object.fromEntries(owners.map((u) => [u.agencyId, u.companyName]))
  res.json(
    threads.map((t) => ({
      threadId: t.threadId,
      agencyId: t.agencyId,
      ownerName: nameMap[t.agencyId] ?? t.agencyId,
      advertiserId: t.advertiserId,
      advertiserName: t.advertiserName,
      lastMessage: t.lastMessage,
      messages: t.messages.map((m) => ({ sender: m.sender, text: maskContactInfo(m.text), createdAt: m.createdAt, quoteCard: m.quoteCard })),
      updatedAt: t.updatedAt,
    })),
  )
})

adminRouter.get('/config', async (_req, res) => {
  const config = await AdminConfig.findOne({ key: 'platform' })
  res.json(config ?? {})
})

adminRouter.put('/config', async (req: AuthRequest, res) => {
  const updates = pickAdminConfig(req.body as Record<string, unknown>)
  const config = await AdminConfig.findOneAndUpdate({ key: 'platform' }, { $set: updates }, { new: true, upsert: true })
  await audit(req.auth!.email, 'update', 'config', 'platform')
  res.json(config)
})

adminRouter.get('/audit-log', async (_req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200)
  res.json(logs.map((l) => ({ ...l.toObject(), id: l.auditId, createdAt: l.createdAt.toISOString() })))
})

adminRouter.post('/notifications/broadcast', async (req: AuthRequest, res) => {
  const { target, title, body, link } = req.body as { target: string; title: string; body: string; link?: string }
  const users = await User.find()
  for (const u of users) {
    if (target === 'advertisers' && u.role !== 'advertiser') continue
    if (target === 'owners' && u.role !== 'media_owner') continue
    const userId = u.role === 'media_owner' ? u.agencyId! : u._id.toString()
    await Notification.create({
      notificationId: newId('n_'),
      userId,
      role: u.role,
      type: 'system',
      title,
      body,
      link,
    })
  }
  res.json({ ok: true })
})
