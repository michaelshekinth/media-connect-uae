import mongoose, { Schema } from 'mongoose'

const messageSchema = new Schema(
  {
    messageId: { type: String, required: true },
    sender: { type: String, enum: ['advertiser', 'owner'], required: true },
    text: { type: String, required: true },
    quoteCard: { type: Schema.Types.Mixed, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const chatThreadSchema = new Schema(
  {
    threadId: { type: String, required: true, unique: true },
    agencyId: { type: String, required: true, index: true },
    agencyName: { type: String, default: '' },
    agencyColor: { type: String, default: '#4f46e5' },
    advertiserId: { type: String, required: true, index: true },
    advertiserName: { type: String, default: '' },
    lastMessage: { type: String, default: '' },
    ownerUnread: { type: Boolean, default: false },
    advertiserUnread: { type: Boolean, default: false },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true },
)

export const ChatThread = mongoose.model('ChatThread', chatThreadSchema)
