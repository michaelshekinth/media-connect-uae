import mongoose, { Schema } from 'mongoose'

const subcategorySchema = new Schema(
  {
    subcategoryId: { type: String, required: true, unique: true },
    categoryId: {
      type: String,
      enum: ['OOH', 'TV', 'Radio', 'Press', 'ContentCreators'],
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
)

subcategorySchema.index({ categoryId: 1, name: 1 }, { unique: true })

export const Subcategory = mongoose.model('Subcategory', subcategorySchema)
