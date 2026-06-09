import { motion } from 'framer-motion'
import { ArrowUpRight, Mic2, Monitor, Radio, Sparkles, Tv } from 'lucide-react'
import type { Listing, MediaType } from '@shared/types'
import { HolographicCategoryIcon } from '../ui/HolographicCategoryIcon'

const categoryConfig: {
  type: MediaType
  icon: typeof Monitor
  description: string
  variant: 'indigo' | 'violet' | 'blue' | 'emerald' | 'orange'
}[] = [
  {
    type: 'OOH',
    icon: Monitor,
    description: 'Billboards, transit wraps & street furniture across the UAE',
    variant: 'indigo',
  },
  {
    type: 'DOOH',
    icon: Sparkles,
    description: 'Digital screens in malls, airports & high-traffic zones',
    variant: 'violet',
  },
  {
    type: 'TC',
    icon: Tv,
    description: 'Prime-time TV spots on national & regional channels',
    variant: 'blue',
  },
  {
    type: 'Radio & Print',
    icon: Radio,
    description: 'Radio campaigns and premium print placements',
    variant: 'emerald',
  },
  {
    type: 'Influencers',
    icon: Mic2,
    description: 'Creator partnerships from micro to macro influencers',
    variant: 'orange',
  },
]

interface FeaturedCategoriesProps {
  listings?: Listing[]
  onSelectCategory: (type: MediaType) => void
}

export function FeaturedCategories({ listings = [], onSelectCategory }: FeaturedCategoriesProps) {
  return (
    <section className="categories-section relative overflow-hidden py-16 sm:py-24">
      <div className="categories-section__bg pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-full border border-indigo-200/80 bg-indigo-50 px-4 py-1 text-xs font-bold tracking-widest text-indigo-600 uppercase">
            Media channels
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Featured Categories
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Explore media types tailored to your campaign goals — tap a category
            to filter placements instantly
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categoryConfig.map((cat, i) => {
            const count = listings.filter((l) => l.mediaType === cat.type).length

            return (
              <motion.button
                key={cat.type}
                type="button"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                whileHover={{ y: -8 }}
                onClick={() => onSelectCategory(cat.type)}
                className={`category-card category-card--${cat.variant} group relative text-left`}
              >
                <div className="category-card__border" aria-hidden />
                <div className="category-card__glow" aria-hidden />
                <div className="category-card__mesh" aria-hidden />

                <div className="category-card__inner">
                  <div className="category-card__accent" aria-hidden />

                  <div className="relative z-10 flex h-full flex-col p-6">
                    <HolographicCategoryIcon
                      icon={cat.icon}
                      variant={cat.variant}
                    />

                    <h3 className="text-lg font-bold tracking-tight text-slate-900">
                      {cat.type}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
                      {cat.description}
                    </p>

                    <div className="category-card__footer mt-5 flex items-center justify-between gap-2 border-t border-slate-200/60 pt-4">
                      <span className="category-card__badge rounded-full px-3 py-1 text-xs font-bold">
                        {count}+ listings
                      </span>
                      <span className="category-card__cta flex items-center gap-1 text-xs font-bold">
                        Explore
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
