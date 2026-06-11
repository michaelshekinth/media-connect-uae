import { motion } from 'framer-motion'
import { BadgeCheck, Clock, MapPin, Star, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MEDIA_CATEGORY_LABELS } from '@shared/constants'
import type { City } from '@shared/types'
import { fetchAgencies } from '@shared/services/publicApi'
import type { MediaOwner } from '@shared/types'

function formatPrice(amount: number): string {
  return amount >= 1000 ? `${Math.round(amount / 1000)}K` : `${amount}`
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-bold text-slate-800">{rating}</span>
    </div>
  )
}

interface TopMediaOwnersProps {
  city?: City
}

export function TopMediaOwners({ city = 'All UAE' }: TopMediaOwnersProps) {
  const [owners, setOwners] = useState<MediaOwner[]>([])

  useEffect(() => {
    let cancelled = false
    const load = async (attempt = 0) => {
      try {
        const data = await fetchAgencies({
          featured: true,
          city: city !== 'All UAE' ? city : undefined,
        })
        if (cancelled) return
        setOwners(
          (data as MediaOwner[]).map((o) => ({
            id: (o as { id?: string }).id ?? '',
            name: o.name,
            initials: o.initials ?? o.name.slice(0, 2),
            color: o.color ?? '#4f46e5',
            about: o.about ?? '',
            rating: o.rating ?? 4.5,
            reviewCount: o.reviewCount ?? 0,
            priceFrom: o.priceFrom ?? 0,
            listingCount: o.listingCount ?? 0,
            mediaTypes: o.mediaTypes ?? [],
            headquarters: o.headquarters ?? (o as { city?: string }).city ?? 'Dubai',
            responseHours: o.responseHours ?? 48,
            verified: o.verified ?? true,
          })),
        )
      } catch {
        if (cancelled) return
        if (attempt < 6) {
          window.setTimeout(() => load(attempt + 1), 800)
        } else {
          setOwners([])
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [city])

  if (owners.length === 0) {
    return (
      <section id="owners" className="bg-gradient-to-b from-white to-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900">Featured Media Owners</h2>
          <p className="mt-3 text-slate-500">Approved media owners will appear here once they join the platform.</p>
        </div>
      </section>
    )
  }

  return (
    <section id="owners" className="bg-gradient-to-b from-white to-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-full border border-orange-200 bg-orange-50 px-4 py-1 text-xs font-bold tracking-widest text-orange-600 uppercase">
            Verified partners
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Featured Media Owners</h2>
          {city !== 'All UAE' && (
            <p className="mt-2 text-sm text-slate-500">Featured in {city}</p>
          )}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {owners.map((owner, i) => (
            <motion.article key={owner.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: owner.color }}>{owner.initials}</div>
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="font-bold text-slate-900">{owner.name}</h3>
                    {owner.verified && <BadgeCheck className="h-4 w-4 text-indigo-600" />}
                  </div>
                  <StarRating rating={owner.rating} />
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-slate-600">{owner.about}</p>
              <div className="mt-4 flex flex-wrap gap-1">
                {owner.mediaTypes.slice(0, 3).map((t) => (
                  <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {MEDIA_CATEGORY_LABELS[t] ?? t}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                <span className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> From {formatPrice(owner.priceFrom)} AED</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {owner.responseHours}h</span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                <MapPin className="h-3 w-3" /> {owner.headquarters}
              </div>
              <Link to={`/agency/${owner.id}`}
                className="mt-4 rounded-xl bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-700">
                View profile
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
