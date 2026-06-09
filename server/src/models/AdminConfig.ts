import mongoose, { Schema } from 'mongoose'

const adminConfigSchema = new Schema(
  {
    key: { type: String, default: 'platform', unique: true },
    categories: { type: [Schema.Types.Mixed], default: [] },
    subscriptionPackages: { type: [Schema.Types.Mixed], default: [] },
    listingFees: { type: [Schema.Types.Mixed], default: [] },
    leadGenFees: { type: [Schema.Types.Mixed], default: [] },
    commissionRules: { type: [Schema.Types.Mixed], default: [] },
    cmsPages: { type: [Schema.Types.Mixed], default: [] },
    emailTemplates: { type: [Schema.Types.Mixed], default: [] },
    settings: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
)

export const AdminConfig = mongoose.model('AdminConfig', adminConfigSchema)
