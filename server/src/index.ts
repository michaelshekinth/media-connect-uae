import { env } from './config/env.js'
import { getApp } from './bootstrap.js'

async function start() {
  const app = await getApp()
  app.listen(env.port, () => {
    console.log(`API running at http://localhost:${env.port}`)
  })
}

start().catch((e) => {
  console.error(e)
  process.exit(1)
})
