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

function FooterLinkList({
  items,
  linkClass = 'text-sm text-slate-400 transition-colors hover:text-orange-400',
}: {
  items: { label: string; href: string }[]
  linkClass?: string
}) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-1 sm:gap-y-2">
      {items.map((link) => (
        <li key={link.label}>
          <a href={link.href} className={linkClass}>
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

export function Footer() {
  const isLanding = useLocation().pathname === '/'

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
          {/* Brand — full width on xs, single col on lg */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-orange-500">
                <Megaphone className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white">MediaConnect UAE</span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              The UAE&apos;s marketplace for connecting advertisers with verified media owners.
            </p>
          </div>

          {/* Portals + Platform — side by side on mobile */}
          <div>
            <h3 className="mb-2.5 text-xs font-semibold tracking-wide text-white uppercase sm:mb-3 sm:text-sm">
              Login
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link to="/login" className="text-sm text-slate-400 transition-colors hover:text-orange-400">
                  Advertiser
                </Link>
              </li>
              <li>
                <a href={MEDIA_OWNER_LOGIN_URL} className="text-sm text-slate-400 transition-colors hover:text-orange-400">
                  Media owner
                </a>
              </li>
              {!isLanding && (
                <li>
                  <a href={ADMIN_LOGIN_URL} className="text-sm text-slate-400 transition-colors hover:text-orange-400">
                    Super admin
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="mb-2.5 text-xs font-semibold tracking-wide text-white uppercase sm:mb-3 sm:text-sm">
              Platform
            </h3>
            <FooterLinkList items={platformLinks} />
          </div>

          {/* Media types — 2-col inline on all breakpoints */}
          <div>
            <h3 className="mb-2.5 text-xs font-semibold tracking-wide text-white uppercase sm:mb-3 sm:text-sm">
              Media types
            </h3>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-1.5">
              {MEDIA_TYPES.map((type) => (
                <li key={type}>
                  <a href="#search" className="text-sm text-slate-400 transition-colors hover:text-orange-400">
                    {type}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities + Company — compact 2-col block */}
          <div className="col-span-2 grid grid-cols-2 gap-x-4 gap-y-6 md:col-span-1 md:grid-cols-1 md:gap-y-0 lg:col-span-1">
            <div>
              <h3 className="mb-2.5 text-xs font-semibold tracking-wide text-white uppercase sm:mb-3 sm:text-sm">
                Cities
              </h3>
              <ul className="grid grid-cols-2 gap-x-2 gap-y-1.5 sm:grid-cols-2">
                {UAE_CITIES.map((city) => (
                  <li key={city}>
                    <a href="#locations" className="text-sm text-slate-400 transition-colors hover:text-orange-400">
                      {city}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:mt-6">
              <h3 className="mb-2.5 text-xs font-semibold tracking-wide text-white uppercase sm:mb-3 sm:text-sm">
                Company
              </h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {companyLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-slate-400 transition-colors hover:text-orange-400">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-800 pt-5 text-center text-xs text-slate-500 sm:mt-8 sm:pt-6 sm:text-sm">
          © 2026 MediaConnect UAE. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
