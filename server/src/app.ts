import express from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/errorHandler.js'
import { authRouter } from './routes/auth.routes.js'
import { publicRouter } from './routes/public.routes.js'
import { advertiserRouter } from './routes/advertiser.routes.js'
import { ownerRouter } from './routes/owner.routes.js'
import { adminRouter } from './routes/admin.routes.js'

export function createApp() {
  const app = express()
  app.use(cors())
  app.use(express.json({ limit: '10mb' }))

  app.get('/api/health', (_req, res) => res.json({ ok: true }))

  app.use('/api/auth', authRouter)
  app.use('/api/public', publicRouter)
  app.use('/api/advertiser', advertiserRouter)
  app.use('/api/owner', ownerRouter)
  app.use('/api/admin', adminRouter)

  app.use(errorHandler)
  return app
}
