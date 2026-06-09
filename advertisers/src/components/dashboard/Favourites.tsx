import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchAgency,
  fetchListings,
  getFavorites,
  toggleFavoriteAgency,
  toggleFavoriteListing,
} from '../../services/userStore'
import type { AgencyProfile } from '@shared/types/user'
import type { Listing } from '@shared/types'

export function Favourites() {
  const [subTab, setSubTab] = useState<'agencies' | 'listings'>('agencies')
  const [agencies, setAgencies] = useState<AgencyProfile[]>([])
  const [listings, setListings] = useState<Listing[]>([])

  const load = async () => {
    const f = await getFavorites()
    const agencyResults = await Promise.all(
      f.agencyIds.map((id) => fetchAgency(id).then((a) => a as unknown as AgencyProfile).catch(() => null)),
    )
    setAgencies(agencyResults.filter(Boolean) as AgencyProfile[])
    const allListings = await fetchListings()
    setListings(f.listingIds.map((id) => allListings.find((l) => l.id === id)).filter(Boolean) as Listing[])
  }

  useEffect(() => {
    load()
  }, [])

  const empty = subTab === 'agencies' ? agencies.length === 0 : listings.length === 0

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button type="button" onClick={() => setSubTab('agencies')}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${subTab === 'agencies' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
          Agencies ({agencies.length})
        </button>
        <button type="button" onClick={() => setSubTab('listings')}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${subTab === 'listings' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
          Listings ({listings.length})
        </button>
      </div>

      {empty ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center">
          <p className="text-slate-600">No saved {subTab} yet.</p>
          <Link to="/browse" className="mt-3 inline-block text-sm font-semibold text-indigo-600">Browse media</Link>
        </div>
      ) : subTab === 'agencies' ? (
        <div className="space-y-3">
          {agencies.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
              <Link to={`/agency/${a.id}`} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ backgroundColor: a.color }}>{a.initials}</div>
                <div>
                  <p className="font-semibold text-slate-900">{a.name}</p>
                  <p className="text-sm text-slate-500">{a.city}</p>
                </div>
              </Link>
              <button type="button" onClick={async () => { await toggleFavoriteAgency(a.id); load() }}
                className="text-sm font-medium text-red-600 hover:text-red-700">Remove</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
              <Link to={`/listing/${l.id}`} className="flex items-center gap-3">
                <img src={l.imageUrl} alt="" className="h-12 w-16 rounded-lg object-cover" />
                <div>
                  <p className="font-semibold text-slate-900">{l.title}</p>
                  <p className="text-sm text-slate-500">{l.mediaType} · {l.city}</p>
                </div>
              </Link>
              <button type="button" onClick={async () => { await toggleFavoriteListing(l.id); load() }}
                className="text-sm font-medium text-red-600 hover:text-red-700">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
