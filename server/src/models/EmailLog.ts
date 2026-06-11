import mongoose, { Schema } from 'mongoose'

const emailLogSchema = new Schema(
  {
    logId: { type: String, required: true, unique: true },
    templateId: { type: String, default: '' },
    to: { type: String, required: true },
    subject: { type: String, default: '' },
    body: { type: String, default: '' },
    payload: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['queued', 'sent', 'failed', 'skipped'], default: 'queued' },
    error: { type: String, default: null },
    sentAt: { type: String, default: null },
  },
  { timestamps: true },
)

export const EmailLog = mongoose.model('EmailLog', emailLogSchema)
