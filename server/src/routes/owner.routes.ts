import { Router } from 'express'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'
import { User } from '../models/User.js'
import { OwnerProfile } from '../models/OwnerProfile.js'
import { Listing } from '../models/Listing.js'
import { QuoteRequest } from '../models/QuoteRequest.js'
import { CustomQuote } from '../models/CustomQuote.js'
import { ChatThread } from '../models/Chat.js'
import { Notification } from '../models/Notification.js'
import { Agency } from '../models/Agency.js'
import { newId } from '../utils/id.js'
import { containsContactInfo, maskContactInfo } from '../utils/contact.js'
import { serializeUser } from '../services/serializers.js'

export const ownerRouter = Router()
ownerRouter.use(requireAuth, requireRole('media_owner'))

function agencyId(req: AuthRequest) {
  return req.auth!.agencyId!
}

ownerRouter.get('/profile', async (req: AuthRequest, res) => {
  const user = await User.findById(req.auth!.sub)
  if (!user) return res.status(404).json({ error: 'Not found' })
  res.json(serializeUser(user))
})

ownerRouter.patch('/profile', async (req: AuthRequest, res) => {
  const user = await User.findByIdAndUpdate(req.auth!.sub, { $set: req.body }, { new: true })
  if (!user) return res.status(404).json({ error: 'Not found' })
  res.json(serializeUser(user))
})

ownerRouter.get('/company-profile', async (req: AuthRequest, res) => {
  const profile = await OwnerProfile.findOne({ agencyId: agencyId(req) })
  res.json(profile ?? null)
})

ownerRouter.put('/company-profile', async (req: AuthRequest, res) => {
  const aid = agencyId(req)
  const profile = await OwnerProfile.findOneAndUpdate(
    { agencyId: aid },
    { $set: { ...req.body, agencyId: aid, userId: req.auth!.sub } },
    { upsert: true, new: true },
  )
  res.json(profile)
})

ownerRouter.post('/company-profile/submit', async (req: AuthRequest, res) => {
  const id = agencyId(req)
  await User.findByIdAndUpdate(req.auth!.sub, {
    ownerProfileComplete: true,
    ownerApprovalStatus: 'submitted',
    companyName: req.body.companyLegalName,
  })
  await Notification.create({
    notificationId: newId('n_'),
    userId: id,
    role: 'media_owner',
    type: 'profile_submitted',
    title: 'Profile submitted',
    body: 'Your company profile is awaiting admin review.',
    link: '/owner/dashboard',
  })
  res.json({ ok: true })
})

ownerRouter.get('/listings', async (req: AuthRequest, res) => {
  const listings = await Listing.find({ agencyId: agencyId(req) }).sort({ createdAt: -1 })
  res.json(listings.map((l) => ({ ...l.toObject(), id: l.listingId })))
})

ownerRouter.get('/listings/:id', async (req: AuthRequest, res) => {
  const listing = await Listing.findOne({ listingId: req.params.id, agencyId: agencyId(req) })
  if (!listing) return res.status(404).json({ error: 'Not found' })
  res.json({ ...listing.toObject(), id: listing.listingId })
})

ownerRouter.post('/listings', async (req: AuthRequest, res) => {
  const user = await User.findById(req.auth!.sub)
  const listingId = newId('listing_')
  const listing = await Listing.create({
    listingId,
    agencyId: agencyId(req),
    agencyName: user?.companyName ?? '',
    ...req.body,
    status: req.body.status ?? 'draft',
  })
  res.status(201).json({ ...listing.toObject(), id: listing.listingId })
})

ownerRouter.put('/listings/:id', async (req: AuthRequest, res) => {
  const existing = await Listing.findOne({ listingId: req.params.id, agencyId: agencyId(req) })
  if (!existing) return res.status(404).json({ error: 'Not found' })

  const body = { ...req.body } as Record<string, unknown>
  delete body.id
  delete body.listingId
  delete body.agencyId
  delete body.createdAt

  const updates: Record<string, unknown> = { ...body }
  if (existing.status === 'approved') {
    updates.status = 'pending_approval'
    updates.submittedAt = new Date().toISOString()
    updates.reviewedAt = null
  }

  const listing = await Listing.findOneAndUpdate(
    { listingId: req.params.id, agencyId: agencyId(req) },
    { $set: updates },
    { new: true },
  )
  if (!listing) return res.status(404).json({ error: 'Not found' })
  res.json({ ...listing.toObject(), id: listing.listingId })
})

ownerRouter.delete('/listings/:id', async (req: AuthRequest, res) => {
  const result = await Listing.deleteOne({ listingId: req.params.id, agencyId: agencyId(req) })
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' })
  res.status(204).send()
})

ownerRouter.post('/listings/:id/submit', async (req: AuthRequest, res) => {
  const listing = await Listing.findOneAndUpdate(
    { listingId: req.params.id, agencyId: agencyId(req) },
    { status: 'pending_approval', submittedAt: new Date().toISOString() },
    { new: true },
  )
  if (!listing) return res.status(404).json({ error: 'Not found' })
  res.json({ ...listing.toObject(), id: listing.listingId })
})

ownerRouter.get('/leads', async (req: AuthRequest, res) => {
  const leads = await QuoteRequest.find({ agencyId: agencyId(req) }).sort({ createdAt: -1 })
  res.json(leads.map((l) => ({ ...l.toObject(), id: l.quoteId })))
})

ownerRouter.get('/chats', async (req: AuthRequest, res) => {
  const threads = await ChatThread.find({ agencyId: agencyId(req) }).sort({ updatedAt: -1 })
  res.json(
    threads.map((t) => ({
      id: t.threadId,
      agencyId: t.agencyId,
      advertiserId: t.advertiserId,
      advertiserName: t.advertiserName,
      lastMessage: t.lastMessage,
      unread: t.ownerUnread,
      messages: t.messages.map((m) => ({
        id: m.messageId,
        threadId: t.threadId,
        sender: m.sender,
        text: m.text,
        quoteCard: m.quoteCard,
        createdAt: m.createdAt,
      })),
      updatedAt: t.updatedAt,
    })),
  )
})

ownerRouter.post('/chats/:threadId/messages', async (req: AuthRequest, res) => {
  const { text } = req.body as { text?: string }
  if (!text?.trim()) return res.status(400).json({ error: 'Message required' })
  if (containsContactInfo(text)) {
    return res.status(400).json({ error: 'Phone numbers and emails are not allowed in chat' })
  }
  const thread = await ChatThread.findOne({ threadId: req.params.threadId, agencyId: agencyId(req) })
  if (!thread) return res.status(404).json({ error: 'Thread not found' })
  const masked = maskContactInfo(text)
  thread.messages.push({ messageId: newId('msg_'), sender: 'owner', text: masked, createdAt: new Date() })
  thread.lastMessage = masked.slice(0, 80)
  thread.advertiserUnread = true
  await thread.save()
  await Notification.create({
    notificationId: newId('n_'),
    userId: thread.advertiserId,
    role: 'advertiser',
    type: 'new_message',
    title: 'New message',
    body: `${thread.agencyName}: ${masked.slice(0, 60)}`,
    link: '/dashboard/chats',
  })
  res.json({ ok: true })
})

ownerRouter.post('/chats/:threadId/read', async (req: AuthRequest, res) => {
  await ChatThread.updateOne({ threadId: req.params.threadId, agencyId: agencyId(req) }, { ownerUnread: false })
  res.json({ ok: true })
})

ownerRouter.get('/custom-quotes', async (req: AuthRequest, res) => {
  const quotes = await CustomQuote.find({ agencyId: agencyId(req) }).sort({ createdAt: -1 })
  res.json(quotes.map((q) => ({ ...q.toObject(), id: q.customQuoteId })))
})

ownerRouter.post('/custom-quotes', async (req: AuthRequest, res) => {
  const customQuoteId = newId('cq_')
  const body = req.body as Record<string, unknown>
  const maskedDesc = maskContactInfo(String(body.description ?? ''))
  const quote = await CustomQuote.create({
    customQuoteId,
    quoteRequestId: body.quoteRequestId,
    threadId: body.threadId,
    agencyId: agencyId(req),
    advertiserId: body.advertiserId,
    advertiserName: body.advertiserName,
    amountAed: body.amountAed,
    description: maskedDesc,
    status: 'sent',
  })
  await QuoteRequest.updateOne({ quoteId: body.quoteRequestId }, { status: 'responded', quotedAmount: body.amountAed, quotedDescription: maskedDesc, customQuoteId })
  const thread = await ChatThread.findOne({ threadId: body.threadId })
  if (thread) {
    thread.messages.push({
      messageId: newId('msg_'),
      sender: 'owner',
      text: `Custom quote: ${Number(body.amountAed).toLocaleString()} AED — ${maskedDesc.slice(0, 100)}`,
      quoteCard: { amount: body.amountAed, description: maskedDesc, quoteId: customQuoteId },
      createdAt: new Date(),
    })
    thread.lastMessage = `Quote: ${Number(body.amountAed).toLocaleString()} AED`
    thread.advertiserUnread = true
    await thread.save()
  }
  await Notification.create({
    notificationId: newId('n_'),
    userId: String(body.advertiserId),
    role: 'advertiser',
    type: 'quote_responded',
    title: 'Quote received',
    body: `You received a custom quote of ${Number(body.amountAed).toLocaleString()} AED`,
    link: '/dashboard/quotes',
  })
  res.status(201).json({ ...quote.toObject(), id: quote.customQuoteId })
})

ownerRouter.get('/notifications', async (req: AuthRequest, res) => {
  const items = await Notification.find({ userId: agencyId(req), role: 'media_owner' }).sort({ createdAt: -1 })
  res.json(items.map((n) => ({ ...n.toObject(), id: n.notificationId, createdAt: n.createdAt.toISOString() })))
})

ownerRouter.get('/stats', async (req: AuthRequest, res) => {
  const aid = agencyId(req)
  const listings = await Listing.find({ agencyId: aid })
  const leads = await QuoteRequest.find({ agencyId: aid })
  const quotes = await CustomQuote.find({ agencyId: aid })
  res.json({
    activeListings: listings.filter((l) => l.status === 'approved').length,
    leadsReceived: leads.length,
    quotesSent: quotes.length,
    dealsWon: quotes.filter((q) => q.status === 'accepted').length,
    leadsByDay: [],
    quotesByStatus: {
      sent: quotes.filter((q) => q.status === 'sent').length,
      accepted: quotes.filter((q) => q.status === 'accepted').length,
      declined: quotes.filter((q) => q.status === 'declined').length,
    },
    listingsByStatus: {
      pending: listings.filter((l) => l.status === 'pending_approval').length,
      approved: listings.filter((l) => l.status === 'approved').length,
      rejected: listings.filter((l) => l.status === 'rejected').length,
    },
  })
})
