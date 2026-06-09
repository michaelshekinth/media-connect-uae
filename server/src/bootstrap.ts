import bcrypt from 'bcryptjs'
import { connectDb } from './db/connect.js'
import { AdminConfig } from './models/AdminConfig.js'
import { AdminUser } from './models/AdminUser.js'
import { defaultAdminConfig } from './seed/defaultConfig.js'
import { createApp } from './app.js'
import type express from 'express'

let app: express.Express | null = null
let bootPromise: Promise<express.Express> | null = null

export async function getApp(): Promise<express.Express> {
  if (app) return app
  if (!bootPromise) {
    bootPromise = (async () => {
      await connectDb()
      await ensureSeed()
      app = createApp()
      return app
    })()
  }
  return bootPromise
}

async function ensureSeed() {
  const adminExists = await AdminUser.findOne({ email: 'admin@mediaconnect.ae' })
  if (!adminExists) {
    await AdminUser.create({
      email: 'admin@mediaconnect.ae',
      passwordHash: await bcrypt.hash('admin123', 10),
      name: 'Super Admin',
    })
    console.log('Auto-seeded super admin')
  }
  const configExists = await AdminConfig.findOne({ key: 'platform' })
  if (!configExists) {
    await AdminConfig.create({ key: 'platform', ...defaultAdminConfig })
    console.log('Auto-seeded platform config')
  }
}
