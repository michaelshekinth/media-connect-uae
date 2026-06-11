import mongoose, { Schema } from 'mongoose'

const purchaseRequestSchema = new Schema(
  {
    requestId: { type: String, required: true, unique: true },
    agencyId: { type: String, required: true, index: true },
    packageId: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending_admin', 'approved', 'rejected'],
      default: 'pending_admin',
    },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true },
)

export const PurchaseRequest = mongoose.model('PurchaseRequest', purchaseRequestSchema)
