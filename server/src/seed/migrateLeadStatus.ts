import mongoose from 'mongoose'
import { env } from '../config/env.js'
import { QuoteRequest } from '../models/QuoteRequest.js'
import { normalizeLeadStatus } from '../utils/quoteStatus.js'

const LEGACY_TO_CANONICAL: Record<string, string> = {
  pending: 'connected',
  responded: 'quoted',
  accepted: 'converted',
  declined: 'lost',
}

async function migrateLeadStatus() {
  await mongoose.connect(env.mongoUri)
  const quotes = await QuoteRequest.find()
  let updated = 0
  for (const q of quotes) {
    const canonical = normalizeLeadStatus(q.status)
    const mapped = LEGACY_TO_CANONICAL[q.status] ? canonical : q.status
    if (mapped !== q.status && ['connected', 'quoted', 'converted', 'lost'].includes(mapped)) {
      q.status = mapped as typeof q.status
      await q.save()
      updated++
    }
  }
  console.log(`Migrated ${updated} quote status values`)
  await mongoose.disconnect()
}

if (process.argv[1]?.includes('migrateLeadStatus')) {
  migrateLeadStatus().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}

export { migrateLeadStatus }
