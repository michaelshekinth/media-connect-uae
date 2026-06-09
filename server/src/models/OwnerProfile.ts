import mongoose, { Schema } from 'mongoose'

const docSchema = new Schema(
  {
    id: String,
    type: String,
    label: String,
    fileName: String,
    mimeType: String,
    data: String,
    uploadedAt: String,
  },
  { _id: false },
)

const ownerProfileSchema = new Schema(
  {
    agencyId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    companyLegalName: { type: String, default: '' },
    authorizedPerson: { type: String, default: '' },
    jobTitle: { type: String, default: '' },
    businessEmail: { type: String, default: '' },
    phone: { type: String, default: '' },
    city: { type: String, default: 'Dubai' },
    address: { type: String, default: '' },
    website: { type: String, default: '' },
    licenseNumber: { type: String, default: '' },
    licenseExpiry: { type: String, default: '' },
    licenseDocument: { type: String, default: null },
    licenseDocumentName: { type: String, default: '' },
    vatTrn: { type: String, default: '' },
    mediaCategories: { type: [String], default: [] },
    companyDescription: { type: String, default: '' },
    logoUrl: { type: String, default: null },
    documents: { type: [docSchema], default: [] },
    rejectionReason: { type: String, default: null },
  },
  { timestamps: true },
)

export const OwnerProfile = mongoose.model('OwnerProfile', ownerProfileSchema)
