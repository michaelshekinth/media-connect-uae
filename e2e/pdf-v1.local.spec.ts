import { test, expect } from '@playwright/test'
import { TEST_CREDENTIALS, URLS } from './helpers/credentials'
import { apiFetch, apiLogin, waitForHealth } from './helpers/api'
import { loginAdvertiser, loginOwner } from './helpers/ui'

const apiBase = process.env.API_URL ?? URLS.api

test.describe('PDF V1 features (local)', () => {
  test.beforeAll(async () => {
    await waitForHealth(apiBase, 30_000)
  })

  test('List Media page loads with Publisher Dashboard CTA', async ({ page }) => {
    await page.goto(`${URLS.advertiser}/list-media`)
    await expect(page.getByRole('heading', { name: /list media|publishers/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /publisher dashboard/i })).toBeVisible()
  })

  test('public subcategories API returns OOH subcategories', async () => {
    const res = await fetch(`${apiBase}/api/public/subcategories?category=OOH`)
    expect(res.ok).toBeTruthy()
    const subs = (await res.json()) as { name: string }[]
    expect(subs.some((s) => s.name === 'DOOH' || s.name === 'Billboard')).toBeTruthy()
  })

  test('public CMS endpoint returns hero and how-it-works', async () => {
    const res = await fetch(`${apiBase}/api/public/cms`)
    expect(res.ok).toBeTruthy()
    const cms = (await res.json()) as { heroImagesByEmirate: Record<string, string>; howItWorks: unknown }
    expect(cms.heroImagesByEmirate).toBeTruthy()
    expect(cms.howItWorks).toBeTruthy()
  })

  test('owner can delist a draft listing via API', async () => {
    const token = await apiLogin(apiBase, 'media_owner', TEST_CREDENTIALS.owner.email, TEST_CREDENTIALS.owner.password)
    const title = `Delist E2E ${Date.now()}`
    const created = await apiFetch<{ id: string }>(apiBase, '/api/owner/listings', token, {
      method: 'POST',
      body: JSON.stringify({ title, mediaType: 'OOH', mediaCategory: 'OOH', city: 'Dubai', status: 'draft' }),
    })
    await apiFetch(apiBase, `/api/owner/listings/${created.id}/delist`, token, { method: 'POST' })
    const listing = await apiFetch<{ status: string }>(apiBase, `/api/owner/listings/${created.id}`, token)
    expect(listing.status).toBe('archived')
  })

  test('owner can update lead status pipeline', async () => {
    const token = await apiLogin(apiBase, 'media_owner', TEST_CREDENTIALS.owner.email, TEST_CREDENTIALS.owner.password)
    const leads = await apiFetch<{ id: string; status: string }[]>(apiBase, '/api/owner/leads', token)
    if (!leads.length) {
      test.skip()
      return
    }
    const leadId = leads[0].id
    await apiFetch(apiBase, `/api/owner/leads/${leadId}/status`, token, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'quoted' }),
    })
    const updated = await apiFetch<{ status: string }[]>(apiBase, '/api/owner/leads', token)
    const lead = updated.find((l) => l.id === leadId)
    expect(lead?.status).toBe('quoted')
  })

  test('advertiser dashboard defaults to chats', async ({ page }) => {
    await loginAdvertiser(page, TEST_CREDENTIALS.advertiser.email, TEST_CREDENTIALS.advertiser.password)
    await page.goto(`${URLS.advertiser}/dashboard`)
    await expect(page).toHaveURL(/\/dashboard\/chats/)
  })

  test('publisher dashboard defaults to chats', async ({ page }) => {
    await loginOwner(page, TEST_CREDENTIALS.owner.email, TEST_CREDENTIALS.owner.password)
    await page.goto(`${URLS.owner}/dashboard`)
    await expect(page).toHaveURL(/\/dashboard\/chats/)
  })
})
