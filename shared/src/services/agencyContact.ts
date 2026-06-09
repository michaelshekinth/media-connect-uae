import { apiFetch } from './apiClient'

export async function getAgencyContactInfo(agencyId: string): Promise<{ email: string; phone: string } | null> {
  try {
    const agency = await apiFetch<{ contactEmail?: string; contactPhone?: string }>(`/public/agencies/${agencyId}`, { auth: false })
    if (agency.contactEmail && agency.contactPhone) {
      return { email: agency.contactEmail, phone: agency.contactPhone }
    }
    return null
  } catch {
    return null
  }
}

export async function revealContact(agencyId: string) {
  return apiFetch<{ email: string; phone: string }>(`/advertiser/reveal-contact/${agencyId}`, {
    method: 'POST',
    role: 'advertiser',
  })
}
