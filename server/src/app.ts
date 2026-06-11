import express from 'express'
import cors from 'cors'
import { getCorsOrigins } from './config/cors.js'
import { errorHandler } from './middleware/errorHandler.js'
import { authRouter } from './routes/auth.routes.js'
import { publicRouter } from './routes/public.routes.js'
import { advertiserRouter } from './routes/advertiser.routes.js'
import { ownerRouter } from './routes/owner.routes.js'
import { adminRouter } from './routes/admin.routes.js'
import {
  adminSubcategoryRouter,
  ownerSubcategoryRouter,
  publicSubcategoryRouter,
} from './routes/subcategory.routes.js'
import { adminCommercialRouter, ownerCommercialRouter } from './routes/commercial.routes.js'

export function createApp() {
  const app = express()
  const origins = getCorsOrigins()
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true)
        if (origins.includes(origin) || /^https:\/\/[\w.-]+\.vercel\.app$/.test(origin)) {
          return callback(null, true)
        }
        callback(null, false)
      },
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '10mb' }))

  app.get('/api/health', (_req, res) => res.json({ ok: true }))

  app.use('/api/auth', authRouter)
  app.use('/api/public', publicRouter)
  app.use('/api/public', publicSubcategoryRouter)
  app.use('/api/advertiser', advertiserRouter)
  app.use('/api/owner', ownerRouter)
  app.use('/api/owner', ownerSubcategoryRouter)
  app.use('/api/owner', ownerCommercialRouter)
  app.use('/api/admin', adminRouter)
  app.use('/api/admin', adminSubcategoryRouter)
  app.use('/api/admin', adminCommercialRouter)

  app.use(errorHandler)
  return app
}
