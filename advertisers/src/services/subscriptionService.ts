import type { AdminSubscriptionPackage } from '@shared/types/admin'
import { apiFetch } from '@shared/services/apiClient'

export async function getSubscriptionPackages(): Promise<AdminSubscriptionPackage[]> {
  return apiFetch<AdminSubscriptionPackage[]>('/public/packages', { auth: false })
}
