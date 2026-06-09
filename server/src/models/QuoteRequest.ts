import mongoose, { Schema } from 'mongoose'

const quoteSchema = new Schema(
  {
    quoteId: { type: String, required: true, unique: true },
    agencyId: { type: String, required: true, index: true },
    agencyName: { type: String, default: '' },
    advertiserId: { type: String, required: true, index: true },
    advertiserName: { type: String, default: '' },
    advertiserEmail: { type: String, default: '' },
    listingId: { type: String, default: null },
    campaignName: { type: String, required: true },
    mediaType: { type: String, required: true },
    budgetRange: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    message: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'responded', 'accepted', 'declined'], default: 'pending' },
    quotedAmount: { type: Number, default: null },
    quotedDescription: { type: String, default: null },
    customQuoteId: { type: String, default: null },
    internalNotes: { type: String, default: '' },
  },
  { timestamps: true },
)

export const QuoteRequest = mongoose.model('QuoteRequest', quoteSchema)
