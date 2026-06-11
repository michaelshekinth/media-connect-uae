import mongoose, { Schema } from 'mongoose'

const revenueEntrySchema = new Schema(
  {
    entryId: { type: String, required: true, unique: true },
    agencyId: { type: String, required: true, index: true },
    modelType: { type: String, enum: ['listing_fees', 'lead_gen', 'commission'], required: true },
    amount: { type: Number, required: true },
    sourceId: { type: String, default: null, index: true },
    status: { type: String, enum: ['pending', 'collected'], default: 'pending' },
    collectedAt: { type: String, default: null },
    notes: { type: String, default: '' },
    adminEmail: { type: String, default: '' },
  },
  { timestamps: true },
)

revenueEntrySchema.index({ agencyId: 1, modelType: 1, sourceId: 1 }, { unique: true, sparse: true })

export const RevenueEntry = mongoose.model('RevenueEntry', revenueEntrySchema)
