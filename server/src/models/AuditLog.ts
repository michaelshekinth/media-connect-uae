import mongoose, { Schema } from 'mongoose'

const auditSchema = new Schema(
  {
    auditId: { type: String, required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String, default: null },
    detail: { type: String, default: null },
    adminEmail: { type: String, required: true },
  },
  { timestamps: true },
)

export const AuditLog = mongoose.model('AuditLog', auditSchema)
