import mongoose, { Schema } from 'mongoose'

const searchHistorySchema = new Schema(
  {
    entryId: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    filters: { type: Schema.Types.Mixed, required: true },
    resultCount: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema)
