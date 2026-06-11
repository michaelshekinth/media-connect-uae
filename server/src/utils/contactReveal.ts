import { PublisherPricingModel } from '../models/PublisherPricingModel.js'

function currentMonthKey(): string {
  const d = new Date()
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

/** Reset contact reveal counter when the calendar month changes. */
export async function ensureContactRevealPeriod(agencyId: string) {
  const month = currentMonthKey()
  await PublisherPricingModel.updateOne(
    { agencyId, contactRevealsResetMonth: { $ne: month } },
    { $set: { contactRevealsUsed: 0, contactRevealsResetMonth: month } },
  )
}

/**
 * Atomically increment reveal usage when a limit applies.
 * Returns false if limit would be exceeded.
 */
export async function tryIncrementContactReveal(agencyId: string, limit: number): Promise<boolean> {
  if (limit <= 0) return true

  await ensureContactRevealPeriod(agencyId)

  const updated = await PublisherPricingModel.findOneAndUpdate(
    {
      agencyId,
      $expr: { $lt: ['$contactRevealsUsed', limit] },
    },
    { $inc: { contactRevealsUsed: 1 } },
    { new: true },
  )
  return !!updated
}
