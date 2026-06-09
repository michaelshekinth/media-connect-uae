import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { AdminUser } from '../models/AdminUser.js'
import { signToken } from '../utils/jwt.js'
import { newId } from '../utils/id.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { serializeUser } from '../services/serializers.js'

export const authRouter = Router()

authRouter.post('/advertiser/signup', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string }
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Valid email and password (6+ chars) required' })
  }
  const exists = await User.findOne({ email: email.toLowerCase() })
  if (exists) return res.status(409).json({ error: 'Email already registered' })
  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, 10),
    fullName: email.split('@')[0],
    role: 'advertiser',
  })
  const token = signToken({ sub: user._id.toString(), email: user.email, role: 'advertiser' })
  res.json({ token, user: serializeUser(user) })
})

authRouter.post('/advertiser/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string }
  const user = await User.findOne({ email: email?.toLowerCase(), role: 'advertiser' })
  if (!user || !(await bcrypt.compare(password ?? '', user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  const token = signToken({ sub: user._id.toString(), email: user.email, role: 'advertiser' })
  res.json({ token, user: serializeUser(user) })
})

authRouter.post('/owner/signup', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string }
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Valid email and password required' })
  }
  const exists = await User.findOne({ email: email.toLowerCase() })
  if (exists) return res.status(409).json({ error: 'Email already registered' })
  const agencyId = newId('agency_')
  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, 10),
    fullName: email.split('@')[0],
    role: 'media_owner',
    agencyId,
    ownerProfileComplete: false,
    ownerApprovalStatus: 'draft',
  })
  const token = signToken({ sub: user._id.toString(), email: user.email, role: 'media_owner', agencyId })
  res.json({ token, user: serializeUser(user) })
})

authRouter.post('/owner/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string }
  const user = await User.findOne({ email: email?.toLowerCase(), role: 'media_owner' })
  if (!user || !(await bcrypt.compare(password ?? '', user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  const token = signToken({
    sub: user._id.toString(),
    email: user.email,
    role: 'media_owner',
    agencyId: user.agencyId ?? undefined,
  })
  res.json({ token, user: serializeUser(user) })
})

authRouter.post('/admin/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string }
  const admin = await AdminUser.findOne({ email: email?.toLowerCase() })
  if (!admin || !(await bcrypt.compare(password ?? '', admin.passwordHash))) {
    return res.status(401).json({ error: 'Invalid admin credentials' })
  }
  const token = signToken({ sub: admin._id.toString(), email: admin.email, role: 'super_admin' })
  res.json({
    token,
    session: { email: admin.email, name: admin.name, role: 'super_admin' as const },
  })
})

authRouter.get('/me', requireAuth, async (req: AuthRequest, res) => {
  if (req.auth!.role === 'super_admin') {
    const admin = await AdminUser.findById(req.auth!.sub)
    if (!admin) return res.status(404).json({ error: 'Not found' })
    return res.json({ session: { email: admin.email, name: admin.name, role: 'super_admin' } })
  }
  const user = await User.findById(req.auth!.sub)
  if (!user) return res.status(404).json({ error: 'Not found' })
  res.json({ user: serializeUser(user) })
})
