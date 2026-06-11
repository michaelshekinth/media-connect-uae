export type LeadStatus = 'connected' | 'quoted' | 'converted' | 'lost'

const LEGACY_MAP: Record<string, LeadStatus> = {
  pending: 'connected',
  responded: 'quoted',
  accepted: 'converted',
  declined: 'lost',
  connected: 'connected',
  quoted: 'quoted',
  converted: 'converted',
  lost: 'lost',
}

export function normalizeLeadStatus(status: string): LeadStatus {
  return LEGACY_MAP[status] ?? 'connected'
}

export function isValidLeadStatus(status: string): status is LeadStatus {
  return ['connected', 'quoted', 'converted', 'lost'].includes(status)
}
