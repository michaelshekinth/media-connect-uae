import { Router } from 'express'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'
import { User } from '../models/User.js'
import { QuoteRequest } from '../models/QuoteRequest.js'
import { ChatThread } from '../models/Chat.js'
import { Notification } from '../models/Notification.js'
import { Activity } from '../models/Activity.js'
import { SearchHistory } from '../models/SearchHistory.js'
import { Agency } from '../models/Agency.js'
import { AdminConfig } from '../models/AdminConfig.js'
import { CustomQuote } from '../models/CustomQuote.js'
import { newId } from '../utils/id.js'
import { containsContactInfo, maskContactInfo } from '../utils/contact.js'
import { serializeUser } from '../services/serializers.js'
import { param } from '../utils/params.js'
import { queueEmail } from '../services/emailService.js'
import { recordRevenueEntry } from '../services/revenueService.js'
import { PublisherPricingModel } from '../models/PublisherPricingModel.js'
import { pickUserProfile } from '../utils/userFields.js'
import { notifyAdmins } from '../services/notifyAdmins.js'

export const advertiserRouter = Router()
advertiserRouter.use(requireAuth, requireRole('advertiser'))

advertiserRouter.get('/profile', async (req: AuthRequest, res) => {
  const user = await User.findById(req.auth!.sub)
  if (!user) return res.status(404).json({ error: 'Not found' })
  res.json(serializeUser(user))
})

advertiserRouter.patch('/profile', async (req: AuthRequest, res) => {
  const updates = pickUserProfile(req.body as Record<string, unknown>)
  const user = await User.findByIdAndUpdate(req.auth!.sub, { $set: updates }, { new: true })
  if (!user) return res.status(404).json({ error: 'Not found' })
  res.json(serializeUser(user))
})

advertiserRouter.get('/favorites', async (req: AuthRequest, res) => {
  const user = await User.findById(req.auth!.sub)
  res.json(user?.favorites ?? { agencyIds: [], listingIds: [] })
})

advertiserRouter.put('/favorites', async (req: AuthRequest, res) => {
  const user = await User.findByIdAndUpdate(req.auth!.sub, { favorites: req.body }, { new: true })
  res.json(user?.favorites)
})

advertiserRouter.post('/recently-viewed/:agencyId', async (req: AuthRequest, res) => {
  const user = await User.findById(req.auth!.sub)
  if (!user) return res.status(404).json({ error: 'Not found' })
  const agencyId = param(req.params.agencyId)
  const ids = [agencyId, ...(user.recentlyViewed ?? []).filter((id) => id !== agencyId)].slice(0, 20)
  user.recentlyViewed = ids
  await user.save()
  res.json({ ok: true })
})

advertiserRouter.get('/quotes', async (req: AuthRequest, res) => {
  const quotes = await QuoteRequest.find({ advertiserId: req.auth!.sub }).sort({ createdAt: -1 })
  res.json(quotes.map((q) => ({ ...q.toObject(), id: q.quoteId, createdAt: q.createdAt.toISOString() })))
})

advertiserRouter.post('/quotes', async (req: AuthRequest, res) => {
  const user = await User.findById(req.auth!.sub)
  if (!user) return res.status(404).json({ error: 'Not found' })
  const body = req.body as Record<string, string | boolean>
  if (!body.agencyId || !body.campaignName?.toString().trim()) {
    return res.status(400).json({ error: 'agencyId and campaignName are required' })
  }
  if (!body.mediaType || !body.budgetRange) {
    return res.status(400).json({ error: 'mediaType and budgetRange are required' })
  }
  const agency = await Agency.findOne({ agencyId: body.agencyId as string })
  if (!agency || agency.status !== 'approved') {
    return res.status(400).json({ error: 'Publisher not found or not approved' })
  }
  const quoteId = newId('quote_')
  const threadId = `${body.agencyId}_${req.auth!.sub}`
  const permitAssistance = body.permitAssistance === true || body.permitAssistance === 'true'
  const quote = await QuoteRequest.create({
    quoteId,
    agencyId: body.agencyId,
    agencyName: body.agencyName ?? agency?.name ?? '',
    advertiserId: req.auth!.sub,
    advertiserName: user.fullName,
    advertiserEmail: user.email,
    listingId: body.listingId ?? null,
    campaignName: body.campaignName,
    mediaType: body.mediaType,
    budgetRange: body.budgetRange,
    startDate: body.startDate,
    endDate: body.endDate,
    message: body.message,
    objectives: body.objectives ? String(body.objectives).split(',').filter(Boolean) : [],
    emirate: body.emirate ?? '',
    permitAssistance,
    status: 'connected',
  })
  let thread = await ChatThread.findOne({ threadId })
  const msgText = `Quote request for "${body.campaignName}" — Budget: ${body.budgetRange}. ${body.message}`
  if (!thread) {
    thread = await ChatThread.create({
      threadId,
      agencyId: body.agencyId,
      agencyName: body.agencyName ?? agency?.name ?? '',
      advertiserId: req.auth!.sub,
      advertiserName: user.fullName,
      lastMessage: msgText.slice(0, 80),
      ownerUnread: true,
      messages: [{ messageId: newId('msg_'), sender: 'advertiser', text: maskContactInfo(msgText), createdAt: new Date() }],
    })
  } else {
    thread.messages.push({ messageId: newId('msg_'), sender: 'advertiser', text: maskContactInfo(msgText), createdAt: new Date() })
    thread.lastMessage = msgText.slice(0, 80)
    thread.ownerUnread = true
    await thread.save()
  }
  await Notification.create({
    notificationId: newId('n_'),
    userId: body.agencyId,
    role: 'media_owner',
    type: 'new_lead',
    title: 'New lead received',
    body: `${user.fullName} requested a quote for "${body.campaignName}"`,
    link: '/owner/dashboard/leads',
  })
  await Activity.create({
    activityId: newId('act_'),
    userId: req.auth!.sub,
    type: 'quote_sent',
    title: 'Quote sent',
    description: `Requested quote from ${body.agencyName}`,
  })

  const ownerUser = await User.findOne({ agencyId: body.agencyId, role: 'media_owner' })
  if (ownerUser?.email) {
    const ownerUrl = process.env.MEDIA_OWNER_URL ?? 'https://media-owner.vercel.app'
    await queueEmail({
      templateId: 'quote_requested',
      to: ownerUser.email,
      subject: 'New quote request on MediaConnect',
      body: `${user.fullName} requested a quote for "${body.campaignName}".\n\nView: ${ownerUrl}/owner/dashboard/chats`,
    })
  }

  if (permitAssistance) {
    await notifyAdmins({
      templateId: 'permit_assistance',
      subject: 'Permit assistance requested',
      body: `${user.fullName} (${user.email}) needs permit help for "${body.campaignName}" from ${body.agencyName ?? agency.name}.`,
    })
  }

  const pricing = await PublisherPricingModel.findOne({ agencyId: body.agencyId })
  if (pricing?.leadGenFees?.active && pricing.leadGenFees.amount) {
    await recordRevenueEntry({
      agencyId: String(body.agencyId),
      modelType: 'lead_gen',
      amount: pricing.leadGenFees.amount,
      sourceId: quoteId,
      notes: 'Lead gen fee on new quote',
    })
  }

  res.status(201).json({ ...quote.toObject(), id: quote.quoteId })
})

advertiserRouter.patch('/quotes/:id/accept', async (req: AuthRequest, res) => {
  const quote = await QuoteRequest.findOne({ quoteId: req.params.id, advertiserId: req.auth!.sub })
  if (!quote) return res.status(404).json({ error: 'Quote not found' })
  quote.status = 'accepted'
  await quote.save()
  if (quote.customQuoteId) {
    await CustomQuote.updateOne({ customQuoteId: quote.customQuoteId }, { status: 'accepted' })
  }
  await Notification.create({
    notificationId: newId('n_'),
    userId: quote.agencyId,
    role: 'media_owner',
    type: 'quote_accepted',
    title: 'Quote accepted',
    body: `${quote.advertiserName} accepted your quote`,
    link: '/owner/dashboard/quotes-sent',
  })
  res.json({ ...quote.toObject(), id: quote.quoteId })
})

advertiserRouter.patch('/quotes/:id/decline', async (req: AuthRequest, res) => {
  const quote = await QuoteRequest.findOne({ quoteId: req.params.id, advertiserId: req.auth!.sub })
  if (!quote) return res.status(404).json({ error: 'Quote not found' })
  quote.status = 'declined'
  await quote.save()
  if (quote.customQuoteId) {
    await CustomQuote.updateOne({ customQuoteId: quote.customQuoteId }, { status: 'declined' })
  }
  await Notification.create({
    notificationId: newId('n_'),
    userId: quote.agencyId,
    role: 'media_owner',
    type: 'quote_declined',
    title: 'Quote declined',
    body: `${quote.advertiserName} declined your quote`,
    link: '/owner/dashboard/quotes-sent',
  })
  res.json({ ...quote.toObject(), id: quote.quoteId })
})

advertiserRouter.get('/chats', async (req: AuthRequest, res) => {
  const threads = await ChatThread.find({ advertiserId: req.auth!.sub }).sort({ updatedAt: -1 })
  res.json(
    threads.map((t) => ({
      id: t.threadId,
      agencyId: t.agencyId,
      agencyName: t.agencyName,
      agencyColor: t.agencyColor,
      lastMessage: t.lastMessage,
      unread: t.advertiserUnread,
      messages: t.messages.map((m) => ({
        id: m.messageId,
        threadId: t.threadId,
        sender: m.sender === 'advertiser' ? 'user' : 'agency',
        text: m.text,
        quoteCard: m.quoteCard,
        createdAt: m.createdAt,
      })),
      updatedAt: t.updatedAt,
    })),
  )
})

advertiserRouter.post('/chats/:threadId/messages', async (req: AuthRequest, res) => {
  const { text } = req.body as { text?: string }
  if (!text?.trim()) return res.status(400).json({ error: 'Message required' })
  if (containsContactInfo(text)) {
    return res.status(400).json({ error: 'Phone numbers and emails are not allowed in chat' })
  }
  const thread = await ChatThread.findOne({ threadId: req.params.threadId, advertiserId: req.auth!.sub })
  if (!thread) return res.status(404).json({ error: 'Thread not found' })
  const masked = maskContactInfo(text)
  thread.messages.push({ messageId: newId('msg_'), sender: 'advertiser', text: masked, createdAt: new Date() })
  thread.lastMessage = masked.slice(0, 80)
  thread.ownerUnread = true
  await thread.save()
  res.json({ ok: true })
})

advertiserRouter.post('/chats/:threadId/read', async (req: AuthRequest, res) => {
  await ChatThread.updateOne({ threadId: req.params.threadId, advertiserId: req.auth!.sub }, { advertiserUnread: false })
  res.json({ ok: true })
})

advertiserRouter.get('/notifications', async (req: AuthRequest, res) => {
  const items = await Notification.find({ userId: req.auth!.sub }).sort({ createdAt: -1 }).limit(50)
  res.json(items.map((n) => ({ ...n.toObject(), id: n.notificationId, createdAt: n.createdAt.toISOString() })))
})

advertiserRouter.get('/activities', async (req: AuthRequest, res) => {
  const items = await Activity.find({ userId: req.auth!.sub }).sort({ createdAt: -1 }).limit(50)
  res.json(items.map((a) => ({ ...a.toObject(), id: a.activityId, createdAt: a.createdAt.toISOString() })))
})

advertiserRouter.get('/search-history', async (req: AuthRequest, res) => {
  const items = await SearchHistory.find({ userId: req.auth!.sub }).sort({ createdAt: -1 }).limit(20)
  res.json(items.map((e) => ({ ...e.toObject(), id: e.entryId, createdAt: e.createdAt.toISOString() })))
})

advertiserRouter.post('/search-history', async (req: AuthRequest, res) => {
  await SearchHistory.create({
    entryId: newId('sh_'),
    userId: req.auth!.sub,
    filters: req.body.filters,
    resultCount: req.body.resultCount ?? 0,
  })
  res.json({ ok: true })
})

advertiserRouter.delete('/search-history', async (req: AuthRequest, res) => {
  await SearchHistory.deleteMany({ userId: req.auth!.sub })
  res.json({ ok: true })
})

advertiserRouter.post('/subscribe', async (req: AuthRequest, res) => {
  const { packageId } = req.body as { packageId?: string }
  const config = await AdminConfig.findOne({ key: 'platform' })
  const pkg = config?.subscriptionPackages?.find((p: { id: string }) => p.id === packageId)
  if (!pkg) return res.status(404).json({ error: 'Package not found' })
  const user = await User.findById(req.auth!.sub)
  if (!user) return res.status(404).json({ error: 'Not found' })
  const startedAt = new Date()
  const expiresAt = new Date(startedAt)
  expiresAt.setDate(expiresAt.getDate() + pkg.durationDays)
  user.subscription = {
    packageId: pkg.id,
    packageName: pkg.name,
    startedAt: startedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    contactViewsRemaining: pkg.contactViewsIncluded,
    revealedAgencyIds: (user.subscription as { revealedAgencyIds?: string[] })?.revealedAgencyIds ?? [],
  }
  await user.save()
  res.json(user.subscription)
})

advertiserRouter.post('/reveal-contact/:agencyId', async (req: AuthRequest, res) => {
  const user = await User.findById(req.auth!.sub)
  if (!user?.subscription) return res.status(403).json({ error: 'No active subscription' })
  const sub = user.subscription as {
    expiresAt: string
    contactViewsRemaining: number
    revealedAgencyIds?: string[]
  }
  if (new Date(sub.expiresAt) < new Date()) return res.status(403).json({ error: 'Subscription expired' })
  const agencyId = param(req.params.agencyId)
  const revealed = sub.revealedAgencyIds ?? []
  if (revealed.includes(agencyId)) {
    const agency = await Agency.findOne({ agencyId })
    return res.json({ email: agency?.businessEmail, phone: agency?.phone })
  }
  if (sub.contactViewsRemaining <= 0) return res.status(403).json({ error: 'No contact views remaining' })
  sub.contactViewsRemaining -= 1
  sub.revealedAgencyIds = [...revealed, agencyId]
  user.subscription = sub
  await user.save()
  const agency = await Agency.findOne({ agencyId })
  res.json({ email: agency?.businessEmail ?? '', phone: agency?.phone ?? '' })
})
