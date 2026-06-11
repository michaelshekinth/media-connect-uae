import type { Page } from '@playwright/test'

export async function loginAdvertiser(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').first().fill(password)
  await page.getByRole('button', { name: /^log in$/i }).click()
  await page.waitForURL(/\/(browse|dashboard)/, { timeout: 20_000 })
}

export async function loginOwner(page: Page, email: string, password: string) {
  await page.goto('/login', { waitUntil: 'networkidle' })
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').first().fill(password)
  await Promise.all([
    page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 30_000 }),
    page.getByRole('button', { name: /^log in$/i }).click(),
  ])
}

export async function loginAdmin(page: Page, email: string, password: string) {
  await page.goto('/login', { waitUntil: 'networkidle' })
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await Promise.all([
    page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 30_000 }),
    page.getByRole('button', { name: /sign in/i }).click(),
  ])
  await page.getByText(/pending approvals|total users|dashboard/i).first().waitFor({ timeout: 15_000 })
}
