import mongoose, { Schema } from 'mongoose'

const notificationSchema = new Schema(
  {
    notificationId: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    role: { type: String, enum: ['advertiser', 'media_owner', 'all'], default: 'advertiser' },
    type: { type: String, default: 'system' },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    read: { type: Boolean, default: false },
    link: { type: String, default: null },
  },
  { timestamps: true },
)

export const Notification = mongoose.model('Notification', notificationSchema)
