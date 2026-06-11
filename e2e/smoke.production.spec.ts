import { test, expect } from '@playwright/test'
import { TEST_CREDENTIALS, URLS } from './helpers/credentials'
import { waitForHealth } from './helpers/api'

test.describe('Production smoke', () => {
  test('Render API health responds', async () => {
    await waitForHealth(URLS.apiProduction, 45_000)
    const res = await fetch(`${URLS.apiProduction}/api/health`)
    expect(res.ok).toBeTruthy()
    const data = (await res.json()) as { ok: boolean }
    expect(data.ok).toBe(true)
  })

  test('Advertiser login page loads', async ({ page }) => {
    const res = await page.goto(`${URLS.advertiserProduction}/login`)
    expect(res?.status()).toBeLessThan(400)
    await expect(page.getByRole('heading', { name: /advertiser login/i })).toBeVisible()
  })

  test('Media owner login page loads', async ({ page }) => {
    const res = await page.goto(`${URLS.ownerProduction}/login`)
    expect(res?.status()).toBeLessThan(400)
    await expect(page.getByRole('heading', { name: /media owner login/i })).toBeVisible()
  })

  test('Super admin login page loads', async ({ page }) => {
    const res = await page.goto(`${URLS.adminProduction}/login`)
    expect(res?.status()).toBeLessThan(400)
    await expect(page.getByRole('heading', { name: /super admin/i })).toBeVisible()
  })

  test('Super admin can sign in', async ({ page }) => {
    test.setTimeout(90_000)
    await page.goto(`${URLS.adminProduction}/login`, { waitUntil: 'networkidle' })
    await page.locator('input[type="email"]').fill(TEST_CREDENTIALS.admin.email)
    await page.locator('input[type="password"]').fill(TEST_CREDENTIALS.admin.password)
    await Promise.all([
      page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 60_000 }),
      page.getByRole('button', { name: /sign in/i }).click(),
    ])
    await expect(page.getByRole('heading', { name: /^dashboard$/i })).toBeVisible({ timeout: 30_000 })
  })

  test('Advertiser browse page loads without login', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    const res = await page.goto(`${URLS.advertiserProduction}/browse`)
    expect(res?.status()).toBeLessThan(400)
    await expect(page.locator('body')).toBeVisible()
    expect(errors).toEqual([])
  })
})
