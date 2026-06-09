import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const APPS = ['advertisers', 'media-owner', 'super-admin', 'shared']

const SHARED_SERVICES = new Set([
  'apiClient',
  'authService',
  'listingCatalog',
  'agencyContact',
])

const SHARED_HOOKS = new Set(['usePublicListings', 'useSearchFilters'])
const SHARED_UTILS = new Set(['fileUpload', 'maskContactInfo', 'searchParams'])

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full)
  }
  return files
}

function fixLine(line, filePath) {
  const app = APPS.find((name) => filePath.includes(`/${name}/`))
  let next = line

  next = next.replace(
    /from ['"](?:\.\.\/)+types\/([^'"]+)['"]/g,
    "from '@shared/types/$1'",
  )
  next = next.replace(/from ['"](?:\.\.\/)+types['"]/g, "from '@shared/types'")

  next = next.replace(
    /from ['"](?:\.\.\/)+constants\/([^'"]+)['"]/g,
    "from '@shared/constants/$1'",
  )
  next = next.replace(/from ['"](?:\.\.\/)+constants['"]/g, "from '@shared/constants'")

  for (const util of SHARED_UTILS) {
    next = next.replace(
      new RegExp(`from ['"](?:\\.\\./)+utils/${util}['"]`, 'g'),
      `from '@shared/utils/${util}'`,
    )
  }

  if (app === 'super-admin') {
    next = next.replace(
      /from ['"](?:\.\.\/)+services\/adminService['"]/g,
      "from '../services/adminService'",
    )
  }

  for (const service of SHARED_SERVICES) {
    next = next.replace(
      new RegExp(`from ['"](?:\\.\\./)+services/${service}['"]`, 'g'),
      `from '@shared/services/${service}'`,
    )
  }

  if (app !== 'advertisers') {
    next = next.replace(
      /from ['"](?:\.\.\/)+services\/userStore['"]/g,
      "from '@advertisers/services/userStore'",
    )
  }

  for (const hook of SHARED_HOOKS) {
    next = next.replace(
      new RegExp(`from ['"](?:\\.\\./)+hooks/${hook}['"]`, 'g'),
      `from '@shared/hooks/${hook}'`,
    )
  }

  next = next.replace(/from ['"](?:\.\.\/)+index\.css['"]/g, "from '@shared/index.css'")

  return next
}

for (const app of APPS) {
  const srcDir = path.join(ROOT, app, 'src')
  if (!fs.existsSync(srcDir)) continue
  for (const file of walk(srcDir)) {
    const original = fs.readFileSync(file, 'utf8')
    const updated = original
      .split('\n')
      .map((line) => fixLine(line, file))
      .join('\n')
    if (updated !== original) fs.writeFileSync(file, updated)
  }
}

console.log('Shared imports updated.')
