import { test, expect } from '@playwright/test'
import { TEST_CREDENTIALS, URLS } from './helpers/credentials'
import { apiFetch, apiLogin, waitForHealth } from './helpers/api'

const apiBase = process.env.API_URL ?? URLS.api

test.describe('API integration', () => {
  test.beforeAll(async () => {
    await waitForHealth(apiBase, 30_000)
  })

  test('auth login works for all roles', async () => {
    const advToken = await apiLogin(apiBase, 'advertiser', TEST_CREDENTIALS.advertiser.email, TEST_CREDENTIALS.advertiser.password)
    const ownerToken = await apiLogin(apiBase, 'media_owner', TEST_CREDENTIALS.owner.email, TEST_CREDENTIALS.owner.password)
    const adminToken = await apiLogin(apiBase, 'super_admin', TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password)
    expect(advToken).toBeTruthy()
    expect(ownerToken).toBeTruthy()
    expect(adminToken).toBeTruthy()
  })

  test('admin dashboard returns stats', async () => {
    const token = await apiLogin(apiBase, 'super_admin', TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password)
    const stats = await apiFetch<{ totalUsers: number }>(apiBase, '/api/admin/dashboard', token)
    expect(stats.totalUsers).toBeGreaterThanOrEqual(2)
  })

  test('owner can list company profile', async () => {
    const token = await apiLogin(apiBase, 'media_owner', TEST_CREDENTIALS.owner.email, TEST_CREDENTIALS.owner.password)
    const profile = await apiFetch<{ companyLegalName: string } | null>(apiBase, '/api/owner/company-profile', token)
    expect(profile?.companyLegalName).toBeTruthy()
  })

  test('public listings endpoint is reachable', async () => {
    const res = await fetch(`${apiBase}/api/public/listings`)
    expect(res.ok).toBeTruthy()
    const data = await res.json()
    const listings = Array.isArray(data) ? data : (data as { items: unknown[] }).items
    expect(Array.isArray(listings)).toBe(true)
  })

  test('admin can list subcategories', async () => {
    const token = await apiLogin(apiBase, 'super_admin', TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password)
    const subs = await apiFetch<unknown[]>(apiBase, '/api/admin/subcategories', token)
    expect(Array.isArray(subs)).toBe(true)
  })

  test('owner features endpoint returns pricing summary', async () => {
    const token = await apiLogin(apiBase, 'media_owner', TEST_CREDENTIALS.owner.email, TEST_CREDENTIALS.owner.password)
    const features = await apiFetch<{ canViewAdvertiserContact: boolean }>(apiBase, '/api/owner/features', token)
    expect(typeof features.canViewAdvertiserContact).toBe('boolean')
  })
})
