import mongoose, { Schema } from 'mongoose'

const publisherCustomFieldSchema = new Schema(
  {
    fieldId: { type: String, required: true, unique: true },
    agencyId: { type: String, required: true, index: true },
    fieldKey: {
      type: String,
      enum: ['duration', 'oohType', 'mediaTypeDetail', 'objective'],
      required: true,
    },
    value: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

publisherCustomFieldSchema.index({ agencyId: 1, fieldKey: 1, value: 1 }, { unique: true })

export const PublisherCustomField = mongoose.model('PublisherCustomField', publisherCustomFieldSchema)
