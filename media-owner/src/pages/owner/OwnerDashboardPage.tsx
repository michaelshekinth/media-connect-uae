import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApprovalGate } from '../../components/owner/ApprovalGate'
import { CompanyDocumentsSection } from '../../components/owner/CompanyDocumentsSection'
import { OwnerChatsPanel } from '../../components/owner/OwnerChatsPanel'
import { OwnerNotifications } from '../../components/owner/OwnerNotifications'
import { OverviewCharts } from '../../components/owner/OverviewCharts'
import { useOwnerAuth } from '../../context/OwnerAuthContext'
import {
  getCompanyProfile,
  getCustomQuotes,
  getInboundLeads,
  deleteOwnerListing,
  getOwnerListings,
  getOwnerStats,
  saveCompanyProfile,
} from '../../services/ownerStore'
import { syncLicenseFromDocuments } from '../../utils/ownerDocuments'
import { MEDIA_TYPES, UAE_CITIES } from '@shared/constants'
import type { OwnerDashboardTab, OwnerCompanyProfile } from '@shared/types/owner'

const tabs: { id: OwnerDashboardTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'listings', label: 'Listings' },
  { id: 'leads', label: 'Leads' },
  { id: 'chats', label: 'Chats' },
  { id: 'quotes-sent', label: 'Quotes Sent' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'company-profile', label: 'Company Profile' },
]

const statusBadge: Record<string, string> = {
  pending_approval: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  pending: 'bg-amber-100 text-amber-800',
  responded: 'bg-blue-100 text-blue-800',
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-emerald-100 text-emerald-800',
}

export function OwnerDashboardPage() {
  const { tab } = useParams<{ tab?: string }>()
  const { user, updateProfile, refreshUser } = useOwnerAuth()
  const navigate = useNavigate()
  const [days, setDays] = useState(30)
  const [profile, setProfile] = useState<OwnerCompanyProfile | null>(null)
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getOwnerStats>> | null>(null)
  const [listings, setListings] = useState<Awaited<ReturnType<typeof getOwnerListings>>>([])
  const [leads, setLeads] = useState<Awaited<ReturnType<typeof getInboundLeads>>>([])
  const [quotes, setQuotes] = useState<Awaited<ReturnType<typeof getCustomQuotes>>>([])

  const activeTab = (tabs.find((t) => t.id === tab)?.id ?? 'overview') as OwnerDashboardTab
  const agencyId = user?.agencyId ?? ''
  const approved = user?.ownerApprovalStatus === 'approved'
  const pending = user?.ownerApprovalStatus === 'submitted'
  const rejected = user?.ownerApprovalStatus === 'rejected'

  useEffect(() => {
    if (!agencyId) return
    getOwnerStats(agencyId, days).then(setStats).catch(() => setStats(null))
    getOwnerListings(agencyId).then(setListings).catch(() => setListings([]))
    getInboundLeads(agencyId).then(setLeads).catch(() => setLeads([]))
    getCustomQuotes(agencyId).then(setQuotes).catch(() => setQuotes([]))
  }, [agencyId, days])

  const setTab = (id: OwnerDashboardTab) => {
    navigate(id === 'overview' ? '/dashboard' : `/dashboard/${id}`)
  }

  const handleDeleteListing = async (listingId: string, title: string) => {
    if (!agencyId) return
    const confirmed = window.confirm(`Delete "${title}"? This cannot be undone.`)
    if (!confirmed) return
    try {
      await deleteOwnerListing(agencyId, listingId)
      setListings((prev) => prev.filter((l) => l.id !== listingId))
    } catch {
      window.alert('Could not delete listing. Please try again.')
    }
  }

  useEffect(() => {
    if (agencyId && activeTab === 'company-profile') {
      getCompanyProfile(agencyId).then((p) => {
        if (p) setProfile({ ...p, documents: p.documents ?? [] })
      })
    }
  }, [agencyId, activeTab])

  const saveProfile = async () => {
    if (!agencyId || !profile) return
    await saveCompanyProfile(agencyId, syncLicenseFromDocuments({ ...profile, documents: profile.documents ?? [] }))
  }

  if (!user?.ownerProfileComplete && user?.role === 'media_owner') {
    navigate('/onboarding')
    return null
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Media Owner Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">{user?.companyName ?? 'Your company'}</p>

      {pending && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your company profile is pending admin approval. You can view the dashboard but cannot create listings yet.
        </div>
      )}
      {rejected && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Your profile was rejected. Please update your company profile and resubmit.
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Active Listings', value: approved ? stats?.activeListings ?? 0 : '—' },
          { label: 'Leads Received', value: approved ? stats?.leadsReceived ?? 0 : '—' },
          { label: 'Quotes Sent', value: approved ? stats?.quotesSent ?? 0 : '—' },
          { label: 'Deals Won', value: approved ? stats?.dealsWon ?? 0 : '—' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto border-b border-slate-200 pb-px">
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold ${activeTab === t.id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'overview' && (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
                <p className="text-sm text-slate-500">Your portfolio performance at a glance</p>
              </div>
              {approved ? (
                <Link to="/listings/new"
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
                  <Plus className="h-4 w-4" /> Create Listing
                </Link>
              ) : (
                <span
                  title="Available after your profile is approved"
                  className="flex cursor-not-allowed items-center gap-2 rounded-xl bg-slate-300 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <Plus className="h-4 w-4" /> Create Listing
                </span>
              )}
            </div>
            {stats && (
              <ApprovalGate message="Analytics will be available once your profile is approved.">
                <OverviewCharts stats={stats} days={days} onDaysChange={setDays} />
              </ApprovalGate>
            )}
          </>
        )}

        {activeTab === 'listings' && (
          <div>
            <ApprovalGate>
              <div className="mb-4 flex justify-end">
                <Link to="/listings/new"
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
                  <Plus className="h-4 w-4" /> Create Listing
                </Link>
              </div>
            </ApprovalGate>
            {listings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center">
                <p className="text-slate-600">No listings yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map((l) => (
                  <div
                    key={l.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300"
                  >
                    <Link to={`/listings/${l.id}`} className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{l.title}</p>
                      <p className="text-sm text-slate-500">
                        {l.mediaCategory} · {l.city} · {l.priceMin.toLocaleString()} AED
                      </p>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${statusBadge[l.status]}`}>
                        {l.status === 'approved' ? 'Live' : l.status.replace('_', ' ')}
                      </span>
                      <Link
                        to={`/listings/${l.id}/edit`}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                        title="Edit listing"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteListing(l.id, l.title)}
                        className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                        title="Delete listing"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'leads' && (
          <ApprovalGate>
            {leads.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center">
                <p className="text-slate-600">No leads yet. When advertisers request quotes, they appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map((l) => (
                  <div key={l.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{l.campaignName}</p>
                        <p className="text-sm text-slate-600">{l.advertiserName} · {l.mediaType}</p>
                        <p className="mt-1 text-sm text-slate-500">{l.budgetRange} · {l.startDate} – {l.endDate}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${statusBadge[l.status]}`}>{l.status}</span>
                    </div>
                    <button type="button" onClick={() => navigate('/dashboard/chats')}
                      className="mt-3 text-sm font-semibold text-amber-600 hover:text-amber-700">Open chat</button>
                  </div>
                ))}
              </div>
            )}
          </ApprovalGate>
        )}

        {activeTab === 'chats' && agencyId && (
          <ApprovalGate>
            <OwnerChatsPanel agencyId={agencyId} />
          </ApprovalGate>
        )}

        {activeTab === 'quotes-sent' && (
          <ApprovalGate>
            {quotes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center">
                <p className="text-slate-600">No custom quotes sent yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quotes.map((q) => (
                  <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{q.amountAed.toLocaleString()} AED</p>
                        <p className="text-sm text-slate-600">{q.advertiserName}</p>
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2">{q.description}</p>
                      </div>
                      <span className={`h-fit rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${statusBadge[q.status]}`}>{q.status}</span>
                    </div>
                    <button type="button" onClick={() => navigate('/dashboard/chats')}
                      className="mt-2 text-sm font-medium text-slate-700 hover:underline">View in chat</button>
                  </div>
                ))}
              </div>
            )}
          </ApprovalGate>
        )}

        {activeTab === 'notifications' && agencyId && <OwnerNotifications agencyId={agencyId} />}

        {activeTab === 'company-profile' && profile && (
          <div className="max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
            <input value={profile.companyLegalName} onChange={(e) => setProfile({ ...profile, companyLegalName: e.target.value })}
              className="w-full rounded-xl border px-4 py-2.5 text-sm" placeholder="Company name" />
            <input value={profile.authorizedPerson} onChange={(e) => setProfile({ ...profile, authorizedPerson: e.target.value })}
              className="w-full rounded-xl border px-4 py-2.5 text-sm" placeholder="Authorized person" />
            <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full rounded-xl border px-4 py-2.5 text-sm" placeholder="Phone" />
            <input value={profile.licenseNumber} onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
              className="w-full rounded-xl border px-4 py-2.5 text-sm" placeholder="License number" />
            <select value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              className="w-full rounded-xl border px-4 py-2.5 text-sm">
              {UAE_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex flex-wrap gap-2">
              {MEDIA_TYPES.map((cat) => (
                <button key={cat} type="button"
                  onClick={() => setProfile({
                    ...profile,
                    mediaCategories: profile.mediaCategories.includes(cat)
                      ? profile.mediaCategories.filter((c) => c !== cat)
                      : [...profile.mediaCategories, cat],
                  })}
                  className={`rounded-full px-3 py-1 text-sm ${profile.mediaCategories.includes(cat) ? 'bg-slate-900 text-white' : 'border'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <CompanyDocumentsSection profile={{ ...profile, documents: profile.documents ?? [] }} onChange={setProfile} />
            {(rejected || !approved) && (
              <button type="button" onClick={async () => {
                if (!agencyId) return
                await saveProfile()
                updateProfile({ ownerApprovalStatus: 'submitted', companyName: profile.companyLegalName })
                refreshUser()
              }}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">
                Resubmit for approval
              </button>
            )}
            {approved && (
              <button type="button" onClick={saveProfile}
                className="rounded-xl border px-5 py-2.5 text-sm font-semibold">Save changes</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
