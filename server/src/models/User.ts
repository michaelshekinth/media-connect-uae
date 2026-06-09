import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    companyName: { type: String, default: '' },
    jobTitle: { type: String, default: '' },
    avatarUrl: { type: String, default: null },
    defaultCity: { type: String, default: 'Dubai' },
    emailNotifications: { type: Boolean, default: true },
    quoteAlerts: { type: Boolean, default: true },
    role: { type: String, enum: ['advertiser', 'media_owner'], required: true },
    agencyId: { type: String, default: null },
    ownerProfileComplete: { type: Boolean, default: false },
    ownerApprovalStatus: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'rejected'],
      default: 'draft',
    },
    favorites: {
      agencyIds: { type: [String], default: [] },
      listingIds: { type: [String], default: [] },
    },
    recentlyViewed: { type: [String], default: [] },
    subscription: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
)

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId; createdAt: Date; updatedAt: Date }
export const User = mongoose.model('User', userSchema)
