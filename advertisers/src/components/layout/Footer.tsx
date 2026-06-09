import { Megaphone } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { MEDIA_TYPES, UAE_CITIES } from '@shared/constants'
import { ADMIN_LOGIN_URL, MEDIA_OWNER_LOGIN_URL } from '@shared/constants/portals'

const platformLinks = [
  { label: 'Browse Media', href: '#search' },
  { label: 'Recent Listings', href: '#listings' },
  { label: 'Featured Locations', href: '#locations' },
  { label: 'Top Media Owners', href: '#owners' },
]

const companyLinks = [
  { label: 'About', href: '#' },
  { label: 'Contact', href: '#' },
  { label: 'Privacy', href: '#' },
]

export function Footer() {
  const isLanding = useLocation().pathname === '/'

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-orange-500">
                <Megaphone className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white">MediaConnect UAE</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              The UAE&apos;s marketplace for connecting advertisers with verified
              media owners — billboards to influencers, all in one place.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-white uppercase">
              Login portals
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="text-sm text-slate-400 transition-colors hover:text-orange-400">
                  Advertiser login
                </Link>
              </li>
              <li>
                <a href={MEDIA_OWNER_LOGIN_URL} className="text-sm text-slate-400 transition-colors hover:text-orange-400">
                  Media owner login
                </a>
              </li>
              {!isLanding && (
                <li>
                  <a href={ADMIN_LOGIN_URL} className="text-sm text-slate-400 transition-colors hover:text-orange-400">
                    Super admin login
                  </a>
                </li>
              )}
            </ul>
            <h3 className="mt-6 mb-4 text-sm font-semibold tracking-wide text-white uppercase">
              Platform
            </h3>
            <ul className="space-y-2">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-orange-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-white uppercase">
              Media Types
            </h3>
            <ul className="space-y-2">
              {MEDIA_TYPES.map((type) => (
                <li key={type}>
                  <a
                    href="#search"
                    className="text-sm text-slate-400 transition-colors hover:text-orange-400"
                  >
                    {type}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-white uppercase">
              Cities
            </h3>
            <ul className="grid grid-cols-2 gap-2">
              {UAE_CITIES.map((city) => (
                <li key={city}>
                  <a
                    href="#locations"
                    className="text-sm text-slate-400 transition-colors hover:text-orange-400"
                  >
                    {city}
                  </a>
                </li>
              ))}
            </ul>
            <h3 className="mt-6 mb-4 text-sm font-semibold tracking-wide text-white uppercase">
              Company
            </h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-orange-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          © 2026 MediaConnect UAE. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
