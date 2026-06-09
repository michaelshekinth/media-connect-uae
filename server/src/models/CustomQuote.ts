import mongoose, { Schema } from 'mongoose'

const customQuoteSchema = new Schema(
  {
    customQuoteId: { type: String, required: true, unique: true },
    quoteRequestId: { type: String, required: true },
    threadId: { type: String, required: true },
    agencyId: { type: String, required: true, index: true },
    advertiserId: { type: String, required: true },
    advertiserName: { type: String, default: '' },
    amountAed: { type: Number, required: true },
    description: { type: String, default: '' },
    attachmentName: { type: String, default: null },
    attachmentData: { type: String, default: null },
    status: { type: String, enum: ['sent', 'accepted', 'declined'], default: 'sent' },
  },
  { timestamps: true },
)

export const CustomQuote = mongoose.model('CustomQuote', customQuoteSchema)
