import mongoose, { Schema } from 'mongoose'

const activitySchema = new Schema(
  {
    activityId: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
  },
  { timestamps: true },
)

export const Activity = mongoose.model('Activity', activitySchema)
