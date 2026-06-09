import mongoose, { Schema } from 'mongoose'

const adminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: 'super_admin' },
  },
  { timestamps: true },
)

export const AdminUser = mongoose.model('AdminUser', adminUserSchema)
