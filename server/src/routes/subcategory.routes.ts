import { Router } from 'express'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'
import { Subcategory } from '../models/Subcategory.js'
import { SubcategoryRequest } from '../models/SubcategoryRequest.js'
import { newId } from '../utils/id.js'
import { param } from '../utils/params.js'
import { isValidMediaCategory } from '../utils/categories.js'
import { pickSubcategoryPatch } from '../utils/userFields.js'

export const publicSubcategoryRouter = Router()

publicSubcategoryRouter.get('/subcategories', async (req, res) => {
  const categoryId = req.query.category as string | undefined
  const filter: Record<string, unknown> = { active: true }
  if (categoryId) {
    if (!isValidMediaCategory(categoryId)) {
      return res.status(400).json({ error: 'Invalid category' })
    }
    filter.categoryId = categoryId
  }
  const subs = await Subcategory.find(filter).sort({ sortOrder: 1, name: 1 })
  res.json(
    subs.map((s) => ({
      id: s.subcategoryId,
      categoryId: s.categoryId,
      name: s.name,
      active: s.active,
      sortOrder: s.sortOrder,
    })),
  )
})

export const ownerSubcategoryRouter = Router()
ownerSubcategoryRouter.use(requireAuth, requireRole('media_owner'))

ownerSubcategoryRouter.post('/subcategory-requests', async (req: AuthRequest, res) => {
  const { categoryId, proposedName } = req.body as { categoryId?: string; proposedName?: string }
  if (!categoryId || !proposedName?.trim()) {
    return res.status(400).json({ error: 'categoryId and proposedName required' })
  }
  if (!isValidMediaCategory(categoryId)) {
    return res.status(400).json({ error: 'Invalid categoryId' })
  }
  const request = await SubcategoryRequest.create({
    requestId: newId('subreq_'),
    agencyId: req.auth!.agencyId!,
    categoryId,
    proposedName: proposedName.trim(),
    status: 'pending',
  })
  res.status(201).json({ ...request.toObject(), id: request.requestId })
})

export const adminSubcategoryRouter = Router()
adminSubcategoryRouter.use(requireAuth, requireRole('super_admin'))

adminSubcategoryRouter.get('/subcategories', async (req, res) => {
  const categoryId = req.query.category as string | undefined
  const filter: Record<string, unknown> = {}
  if (categoryId) {
    if (!isValidMediaCategory(categoryId)) {
      return res.status(400).json({ error: 'Invalid category' })
    }
    filter.categoryId = categoryId
  }
  const subs = await Subcategory.find(filter).sort({ categoryId: 1, sortOrder: 1 })
  res.json(subs.map((s) => ({ ...s.toObject(), id: s.subcategoryId })))
})

adminSubcategoryRouter.post('/subcategories', async (req, res) => {
  const { categoryId, name, sortOrder } = req.body as { categoryId: string; name: string; sortOrder?: number }
  if (!categoryId || !name?.trim()) return res.status(400).json({ error: 'categoryId and name required' })
  if (!isValidMediaCategory(categoryId)) {
    return res.status(400).json({ error: 'Invalid categoryId' })
  }
  const subcategoryId = newId('sub_')
  const sub = await Subcategory.create({
    subcategoryId,
    categoryId,
    name: name.trim(),
    sortOrder: sortOrder ?? 0,
    active: true,
  })
  res.status(201).json({ ...sub.toObject(), id: sub.subcategoryId })
})

adminSubcategoryRouter.patch('/subcategories/:id', async (req, res) => {
  const updates = pickSubcategoryPatch(req.body as Record<string, unknown>)
  if (updates.categoryId && !isValidMediaCategory(String(updates.categoryId))) {
    return res.status(400).json({ error: 'Invalid categoryId' })
  }
  const sub = await Subcategory.findOneAndUpdate(
    { subcategoryId: req.params.id },
    { $set: updates },
    { new: true },
  )
  if (!sub) return res.status(404).json({ error: 'Not found' })
  res.json({ ...sub.toObject(), id: sub.subcategoryId })
})

adminSubcategoryRouter.delete('/subcategories/:id', async (req, res) => {
  await Subcategory.updateOne({ subcategoryId: req.params.id }, { active: false })
  res.json({ ok: true })
})

adminSubcategoryRouter.get('/subcategory-requests', async (_req, res) => {
  const requests = await SubcategoryRequest.find({ status: 'pending' }).sort({ createdAt: -1 })
  res.json(requests.map((r) => ({ ...r.toObject(), id: r.requestId })))
})

adminSubcategoryRouter.post('/subcategory-requests/:id/approve', async (req, res) => {
  const request = await SubcategoryRequest.findOne({ requestId: req.params.id })
  if (!request) return res.status(404).json({ error: 'Not found' })
  if (!isValidMediaCategory(request.categoryId)) {
    return res.status(400).json({ error: 'Request has invalid categoryId' })
  }
  const subcategoryId = newId('sub_')
  await Subcategory.create({
    subcategoryId,
    categoryId: request.categoryId,
    name: request.proposedName,
    active: true,
    sortOrder: 99,
  })
  request.status = 'approved'
  request.adminNotes = (req.body as { notes?: string }).notes ?? ''
  await request.save()
  res.json({ ok: true, subcategoryId })
})

adminSubcategoryRouter.post('/subcategory-requests/:id/reject', async (req, res) => {
  const { notes } = req.body as { notes?: string }
  await SubcategoryRequest.updateOne(
    { requestId: param(req.params.id) },
    { status: 'rejected', adminNotes: notes ?? '' },
  )
  res.json({ ok: true })
})
