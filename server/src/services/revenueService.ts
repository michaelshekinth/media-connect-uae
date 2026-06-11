import { PublisherPricingModel } from '../models/PublisherPricingModel.js'
import { RevenueEntry } from '../models/RevenueEntry.js'
import { newId } from '../utils/id.js'

type RevenueModelType = 'listing_fees' | 'lead_gen' | 'commission'

function toDbModelType(modelType: 'listing_fee' | 'lead_gen' | 'commission'): RevenueModelType {
  if (modelType === 'listing_fee') return 'listing_fees'
  return modelType
}

export async function recordRevenueEntry(opts: {
  agencyId: string
  modelType: 'listing_fee' | 'lead_gen' | 'commission'
  amount: number
  sourceId?: string
  notes?: string
}) {
  const pricing = await PublisherPricingModel.findOne({ agencyId: opts.agencyId })
  if (!pricing) return null

  let active = false
  if (opts.modelType === 'listing_fee') active = pricing.listingFees?.active ?? false
  if (opts.modelType === 'lead_gen') active = pricing.leadGenFees?.active ?? false
  if (opts.modelType === 'commission') active = pricing.commission?.active ?? false
  if (!active || opts.amount <= 0) return null

  const dbModelType = toDbModelType(opts.modelType)
  const sourceId = opts.sourceId ?? ''

  if (sourceId) {
    const existing = await RevenueEntry.findOne({
      agencyId: opts.agencyId,
      modelType: dbModelType,
      sourceId,
    })
    if (existing) return existing
  }

  try {
    return await RevenueEntry.create({
      entryId: newId('rev_'),
      agencyId: opts.agencyId,
      modelType: dbModelType,
      amount: opts.amount,
      sourceId,
      status: 'pending',
      notes: opts.notes ?? '',
    })
  } catch (e) {
    if (sourceId && (e as { code?: number }).code === 11000) {
      return RevenueEntry.findOne({ agencyId: opts.agencyId, modelType: dbModelType, sourceId })
    }
    throw e
  }
}
