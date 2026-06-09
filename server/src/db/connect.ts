import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { env } from '../config/env.js'

let memoryServer: MongoMemoryServer | null = null

export async function connectDb(): Promise<string> {
  let uri = env.mongoUri
  if (!uri) {
    if (process.env.VERCEL || process.env.RENDER) {
      throw new Error('MONGODB_URI environment variable is required in production')
    }
    memoryServer = await MongoMemoryServer.create()
    uri = memoryServer.getUri('mediaconnect')
    console.log('Using in-memory MongoDB (set MONGODB_URI for persistent DB)')
  }
  await mongoose.connect(uri)
  console.log('MongoDB connected')
  return uri
}

export async function disconnectDb() {
  await mongoose.disconnect()
  if (memoryServer) {
    await memoryServer.stop()
    memoryServer = null
  }
}
