import { env } from './config/env.js'
import { getApp } from './bootstrap.js'

async function start() {
  const app = await getApp()
  app.listen(env.port, '0.0.0.0', () => {
    console.log(`API running on port ${env.port}`)
  })
}

start().catch((e) => {
  console.error(e)
  process.exit(1)
})
