import mongoose, { Schema } from 'mongoose'

const reviewSchema = new Schema(
  { id: String, author: String, rating: Number, text: String, date: String },
  { _id: false },
)

const pricingPlanSchema = new Schema(
  { id: String, name: String, priceFrom: Number, priceTo: Number, features: [String], popular: Boolean },
  { _id: false },
)

const agencySchema = new Schema(
  {
    agencyId: { type: String, required: true, unique: true },
    ownerUserId: { type: String, default: null },
    name: { type: String, required: true },
    initials: { type: String, default: '' },
    color: { type: String, default: '#4f46e5' },
    coverImage: { type: String, default: '' },
    logoUrl: { type: String, default: null },
    gallery: { type: [String], default: [] },
    about: { type: String, default: '' },
    rating: { type: Number, default: 4.5 },
    reviewCount: { type: Number, default: 0 },
    city: { type: String, default: 'Dubai' },
    lat: { type: Number, default: 25.2048 },
    lng: { type: Number, default: 55.2708 },
    address: { type: String, default: '' },
    mediaTypes: { type: [String], default: [] },
    services: { type: [String], default: [] },
    pricingPlans: { type: [pricingPlanSchema], default: [] },
    deliverables: { type: [String], default: [] },
    responseHours: { type: Number, default: 48 },
    verified: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    featuredFrom: { type: String, default: null },
    featuredUntil: { type: String, default: null },
    featuredCities: { type: [String], default: [] },
    avgResponseHours: { type: Number, default: 48 },
    reviews: { type: [reviewSchema], default: [] },
    businessEmail: { type: String, default: '' },
    phone: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  },
  { timestamps: true },
)

export const Agency = mongoose.model('Agency', agencySchema)
