import { test, expect } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { TEST_CREDENTIALS, URLS, DEMO_OWNER_AGENCY_ID } from './helpers/credentials'
import { apiFetch, apiLogin } from './helpers/api'
import { loginAdmin, loginAdvertiser, loginOwner } from './helpers/ui'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturePng = path.join(__dirname, 'fixtures', 'tiny.png')

const listingTitle = `E2E Test Billboard ${Date.now()}`

test.describe.serial('Full marketplace flow (local)', () => {
  test('Owner creates listing with description', async ({ browser }) => {
    const context = await browser.newContext({ baseURL: URLS.owner })
    const page = await context.newPage()
    await loginOwner(page, TEST_CREDENTIALS.owner.email, TEST_CREDENTIALS.owner.password)
    await page.goto('/listings/new')
    await expect(page.getByRole('heading', { name: /create listing/i })).toBeVisible()

    await page.getByPlaceholder(/sheikh zayed/i).fill(listingTitle)
    await page.getByRole('button', { name: /next: add details/i }).click()

    await page.getByPlaceholder(/financial centre/i).fill('Business Bay')
    await page.getByPlaceholder(/premium ooh/i).fill(
      'Premium highway-facing billboard in Dubai with high daily impressions. Ideal for brand awareness campaigns.',
    )

    const fileInput = page.locator('input[type="file"]').first()
    if (await fileInput.count()) {
      await fileInput.setInputFiles(fixturePng)
    }

    await page.getByRole('button', { name: /submit for approval/i }).click()
    await expect(page.getByText(/waiting to approve|submitted|pending/i).first()).toBeVisible({
      timeout: 20_000,
    })
    await context.close()
  })

  test('Admin approves listing', async ({ browser }) => {
    const context = await browser.newContext({ baseURL: URLS.admin })
    const page = await context.newPage()
    await loginAdmin(page, TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password)
    await page.goto('/approvals')
    await page.getByRole('button', { name: /listings/i }).click()
    await expect(page.getByText(listingTitle)).toBeVisible({ timeout: 15_000 })
    await page.getByRole('button', { name: /^approve$/i }).first().click()
    await expect(page.getByText(listingTitle)).toBeHidden({ timeout: 15_000 })
    await context.close()
  })

  test('Advertiser requests quote on approved listing', async ({ browser }) => {
    const listingsRes = await fetch(`${URLS.api}/api/public/listings`)
    const listingsPayload = await listingsRes.json()
    const listings = (
      Array.isArray(listingsPayload)
        ? listingsPayload
        : (listingsPayload as { items: { id: string; title: string }[] }).items
    ) as { id: string; title: string }[]
    const listing = listings.find((l) => l.title === listingTitle)
    expect(listing).toBeTruthy()

    const context = await browser.newContext({ baseURL: URLS.advertiser })
    const page = await context.newPage()
    await loginAdvertiser(page, TEST_CREDENTIALS.advertiser.email, TEST_CREDENTIALS.advertiser.password)
    await page.goto(`/listing/${listing!.id}`)
    await page.getByRole('button', { name: /request quote/i }).click()
    await page.getByPlaceholder(/summer brand/i).fill('E2E Campaign 2026')
    await page.locator('input[type="date"]').first().fill('2026-07-01')
    await page.locator('input[type="date"]').nth(1).fill('2026-08-01')
    await page.getByRole('button', { name: /send quote request/i }).click()
    await expect(page.getByText(/quote sent/i)).toBeVisible({ timeout: 20_000 })
    await context.close()
  })

  test('Advertiser and owner exchange chat messages', async ({ browser }) => {
    const advContext = await browser.newContext({ baseURL: URLS.advertiser })
    const advPage = await advContext.newPage()
    await loginAdvertiser(advPage, TEST_CREDENTIALS.advertiser.email, TEST_CREDENTIALS.advertiser.password)
    await advPage.goto('/dashboard/chats')
    await advPage.getByRole('button', { name: /demo media/i }).click()
    await expect(advPage.getByText(/quote request/i).first()).toBeVisible({ timeout: 20_000 })

    const advMessage = `Hello from advertiser E2E run ${Math.random().toString(36).slice(2, 8)}`
    await advPage.getByPlaceholder(/type a message/i).fill(advMessage)
    await advPage.getByRole('button', { name: /^send$/i }).click()
    await expect(advPage.locator('.bg-indigo-600').getByText(advMessage)).toBeVisible({ timeout: 15_000 })
    await advContext.close()

    const ownerContext = await browser.newContext({ baseURL: URLS.owner })
    const ownerPage = await ownerContext.newPage()
    await loginOwner(ownerPage, TEST_CREDENTIALS.owner.email, TEST_CREDENTIALS.owner.password)
    await ownerPage.goto('/dashboard/chats')
    await ownerPage.getByRole('button', { name: /demo media|test advertiser/i }).click()
    await expect(ownerPage.getByText(advMessage).first()).toBeVisible({ timeout: 20_000 })

    const ownerMessage = `Reply from owner E2E run ${Math.random().toString(36).slice(2, 8)}`
    await ownerPage.getByPlaceholder(/type a message/i).fill(ownerMessage)
    await ownerPage.locator('form button[type="submit"]').click()
    await expect(ownerPage.getByText(ownerMessage).first()).toBeVisible({ timeout: 15_000 })
    await ownerContext.close()

    const advToken = await apiLogin(URLS.api, 'advertiser', TEST_CREDENTIALS.advertiser.email, TEST_CREDENTIALS.advertiser.password)
    const chats = await apiFetch<{ messages: { text: string }[] }[]>(
      URLS.api,
      '/api/advertiser/chats',
      advToken,
    )
    const thread = chats.find((c) => c.messages.some((m) => m.text.includes(ownerMessage)))
    expect(thread).toBeTruthy()
  })

  test('Approved listing is public via API', async () => {
    const res = await fetch(`${URLS.api}/api/public/listings`)
    expect(res.ok).toBeTruthy()
    const payload = await res.json()
    const listings = (
      Array.isArray(payload) ? payload : (payload as { items: { title: string; agencyId: string }[] }).items
    ) as { title: string; agencyId: string }[]
    const match = listings.find((l) => l.title === listingTitle && l.agencyId === DEMO_OWNER_AGENCY_ID)
    expect(match).toBeTruthy()
  })
})
