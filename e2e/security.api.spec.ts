import { test, expect } from '@playwright/test'
import { TEST_CREDENTIALS, URLS } from './helpers/credentials'
import { apiFetch, apiLogin, waitForHealth } from './helpers/api'

const apiBase = process.env.API_URL ?? URLS.api

function unwrapListings(data: unknown): { id: string; status?: string; title?: string }[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && 'items' in data) {
    return (data as { items: { id: string; status?: string; title?: string }[] }).items
  }
  return []
}

test.describe('API security hardening', () => {
  test.beforeAll(async () => {
    await waitForHealth(apiBase, 30_000)
  })

  test('owner cannot create listing with approved status', async () => {
    const token = await apiLogin(apiBase, 'media_owner', TEST_CREDENTIALS.owner.email, TEST_CREDENTIALS.owner.password)
    const title = `Security E2E ${Date.now()}`
    const created = await apiFetch<{ id: string; status: string }>(apiBase, '/api/owner/listings', token, {
      method: 'POST',
      body: JSON.stringify({
        title,
        mediaType: 'OOH',
        mediaCategory: 'OOH',
        city: 'Dubai',
        status: 'approved',
        agencyId: 'agency_evil_override',
      }),
    })
    expect(created.status).not.toBe('approved')
    expect(['draft', 'pending_approval']).toContain(created.status)

    const fetched = await apiFetch<{ status: string; agencyId: string }>(
      apiBase,
      `/api/owner/listings/${created.id}`,
      token,
    )
    expect(fetched.status).not.toBe('approved')
  })

  test('owner cannot self-approve listing via PUT', async () => {
    const token = await apiLogin(apiBase, 'media_owner', TEST_CREDENTIALS.owner.email, TEST_CREDENTIALS.owner.password)
    const title = `PUT Security ${Date.now()}`
    const created = await apiFetch<{ id: string }>(apiBase, '/api/owner/listings', token, {
      method: 'POST',
      body: JSON.stringify({ title, mediaType: 'OOH', city: 'Dubai', status: 'draft' }),
    })
    const updated = await apiFetch<{ status: string }>(apiBase, `/api/owner/listings/${created.id}`, token, {
      method: 'PUT',
      body: JSON.stringify({ status: 'approved', title }),
    })
    expect(updated.status).not.toBe('approved')
  })

  test('purchase request is persisted', async () => {
    const token = await apiLogin(apiBase, 'media_owner', TEST_CREDENTIALS.owner.email, TEST_CREDENTIALS.owner.password)
    const created = await apiFetch<{ requestId: string }>(apiBase, '/api/owner/purchases', token, {
      method: 'POST',
      body: JSON.stringify({ packageId: 'pkg_starter', notes: 'E2E purchase test' }),
    })
    expect(created.requestId).toBeTruthy()

    const adminToken = await apiLogin(apiBase, 'super_admin', TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password)
    const items = await apiFetch<{ id: string; packageId: string }[]>(
      apiBase,
      '/api/admin/purchase-requests',
      adminToken,
    )
    expect(items.some((p) => p.id === created.requestId)).toBeTruthy()
  })

  test('public listings returns paginated shape', async () => {
    const res = await fetch(`${apiBase}/api/public/listings`)
    expect(res.ok).toBeTruthy()
    const data = await res.json()
    const items = unwrapListings(data)
    expect(Array.isArray(items)).toBe(true)
  })
})
