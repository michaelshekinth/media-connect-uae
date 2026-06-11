import { BadgeCheck, BarChart3, Globe2, Megaphone, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MEDIA_OWNER_LOGIN_URL } from '@shared/constants/portals'

const benefits = [
  {
    icon: Globe2,
    title: 'Reach UAE advertisers',
    description: 'Get discovered by brands actively searching for billboards, TV, radio, press, and creator placements.',
  },
  {
    icon: BarChart3,
    title: 'Manage inventory online',
    description: 'Publish listings, update availability, and respond to quote requests from one dashboard.',
  },
  {
    icon: Users,
    title: 'Verified marketplace',
    description: 'Join a curated network of media owners vetted by the MediaConnect team.',
  },
  {
    icon: BadgeCheck,
    title: 'Leads, not cold outreach',
    description: 'Receive qualified RFQs with campaign details — budget, dates, and objectives included.',
  },
]

export function ListMediaPage() {
  return (
    <main className="pb-20">
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950 px-4 py-20 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-orange-500/30 blur-3xl" />
          <div className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90">
            <Megaphone className="h-4 w-4 text-orange-300" />
            For media owners & publishers
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            List your media on the UAE&apos;s #1 marketplace
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
            MediaConnect UAE connects verified publishers with advertisers looking for OOH, TV, radio,
            press, and content creator inventory across all seven emirates.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href={MEDIA_OWNER_LOGIN_URL}
              className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600"
            >
              Publisher Dashboard
            </a>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
            >
              Browse as advertiser
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900">Why list with MediaConnect?</h2>
          <p className="mt-3 text-slate-600">Everything you need to showcase inventory and win campaigns</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {benefits.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-indigo-100 bg-white p-8 text-center shadow-sm sm:p-10">
          <h2 className="text-2xl font-bold text-slate-900">Ready to publish your inventory?</h2>
          <p className="mt-3 text-slate-600">
            Create your publisher account, complete your profile, and start receiving quote requests from
            advertisers across the UAE.
          </p>
          <a
            href={MEDIA_OWNER_LOGIN_URL}
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-base font-bold text-white shadow-lg hover:opacity-90"
          >
            Go to Publisher Dashboard
          </a>
        </div>
      </section>
    </main>
  )
}
