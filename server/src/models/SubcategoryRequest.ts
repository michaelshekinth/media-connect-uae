import mongoose, { Schema } from 'mongoose'

const subcategoryRequestSchema = new Schema(
  {
    requestId: { type: String, required: true, unique: true },
    agencyId: { type: String, required: true, index: true },
    categoryId: {
      type: String,
      enum: ['OOH', 'TV', 'Radio', 'Press', 'ContentCreators'],
      required: true,
    },
    proposedName: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true },
)

export const SubcategoryRequest = mongoose.model('SubcategoryRequest', subcategoryRequestSchema)
