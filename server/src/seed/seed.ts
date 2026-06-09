import bcrypt from 'bcryptjs'
import { connectDb, disconnectDb } from '../db/connect.js'
import { AdminConfig } from '../models/AdminConfig.js'
import { AdminUser } from '../models/AdminUser.js'
import { defaultAdminConfig } from './defaultConfig.js'

async function seed() {
  await connectDb()

  const adminExists = await AdminUser.findOne({ email: 'admin@mediaconnect.ae' })
  if (!adminExists) {
    await AdminUser.create({
      email: 'admin@mediaconnect.ae',
      passwordHash: await bcrypt.hash('admin123', 10),
      name: 'Super Admin',
    })
    console.log('Seeded super admin: admin@mediaconnect.ae / admin123')
  }

  const configExists = await AdminConfig.findOne({ key: 'platform' })
  if (!configExists) {
    await AdminConfig.create({ key: 'platform', ...defaultAdminConfig })
    console.log('Seeded platform config')
  }

  await disconnectDb()
  console.log('Seed complete')
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
