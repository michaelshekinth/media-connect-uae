import mongoose, { Schema } from 'mongoose'

const feeModeSchema = new Schema(
  {
    mode: { type: String, default: 'free' },
    amount: { type: Number, default: 0 },
    active: { type: Boolean, default: false },
  },
  { _id: false },
)

const publisherPricingModelSchema = new Schema(
  {
    agencyId: { type: String, required: true, unique: true },
    listingFees: {
      type: feeModeSchema,
      default: () => ({ mode: 'free', amount: 0, active: false }),
    },
    leadGenFees: {
      type: feeModeSchema,
      default: () => ({ mode: 'free', amount: 0, active: false }),
    },
    commission: {
      type: new Schema(
        { mode: { type: String, default: 'free' }, rate: { type: Number, default: 0 }, active: { type: Boolean, default: false } },
        { _id: false },
      ),
      default: () => ({ mode: 'free', rate: 0, active: false }),
    },
    canViewAdvertiserContact: { type: Boolean, default: false },
    contactRevealLimit: { type: Number, default: 0 },
    contactRevealsUsed: { type: Number, default: 0 },
    contactRevealsResetMonth: { type: String, default: '' },
  },
  { timestamps: true },
)

export const PublisherPricingModel = mongoose.model('PublisherPricingModel', publisherPricingModelSchema)
