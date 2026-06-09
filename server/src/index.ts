import express from 'express'
import cors from 'cors'
import { connectDb } from './db/connect.js'
import { env } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { authRouter } from './routes/auth.routes.js'
import { publicRouter } from './routes/public.routes.js'
import { advertiserRouter } from './routes/advertiser.routes.js'
import { ownerRouter } from './routes/owner.routes.js'
import { adminRouter } from './routes/admin.routes.js'
import { AdminConfig } from './models/AdminConfig.js'
import { AdminUser } from './models/AdminUser.js'
import bcrypt from 'bcryptjs'
import { defaultAdminConfig } from './seed/defaultConfig.js'

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

async function start() {
  await connectDb()
  await ensureSeed()
  app.listen(env.port, () => {
    console.log(`API running at http://localhost:${env.port}`)
  })
}

start().catch((e) => {
  console.error(e)
  process.exit(1)
})
