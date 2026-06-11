import { motion } from 'framer-motion'
import { CheckCircle2, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { MEDIA_CATEGORIES, MEDIA_CATEGORY_COLORS, MEDIA_CATEGORY_LABELS } from '@shared/constants'

const HERO_POSTER =
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&q=85'

/** Local Mixkit clips — media spaces, billboards, cinema, digital screens */
const HERO_VIDEOS = [
  { src: '/hero/31014.mp4', theme: 'Dubai billboards at night' },
  { src: '/hero/30952.mp4', theme: 'Rooftop media placements' },
  { src: '/hero/40676.mp4', theme: 'Cinema & movies' },
  { src: '/hero/4192.mp4', theme: 'Digital screens & broadcast' },
] as const

const ROTATE_MS = 8000

const trustItems = [
  'Free for advertisers',
  '100% online',
  'Quotes within 48h',
  'Verified media owners',
]

interface HeroProps {
  heroImage?: string
  selectedEmirate?: string | null
}

function HeroVideoRotator({ poster }: { poster: string }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_VIDEOS.length)
    }, ROTATE_MS)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return
      if (i === activeIndex) {
        video.currentTime = 0
        void video.play().catch(() => {})
      } else {
        video.pause()
      }
    })
  }, [activeIndex])

  return (
    <>
      {HERO_VIDEOS.map((video, i) => (
        <video
          key={video.src}
          ref={(el) => {
            videoRefs.current[i] = el
          }}
          autoPlay={i === 0}
          muted
          loop
          playsInline
          poster={poster}
          className={`hero-video absolute inset-0 h-full w-full object-cover transition-opacity duration-[2000ms] ${
            i === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src={video.src} type="video/mp4" />
        </video>
      ))}
      <div className="hero-film-grain absolute inset-0" aria-hidden />
    </>
  )
}

function HeroBackground({ heroImage, selectedEmirate }: HeroProps) {
  const [reduceMotion, setReduceMotion] = useState(false)
  const poster = heroImage || HERO_POSTER
  const useEmirateImage = !!selectedEmirate && heroImage && heroImage !== HERO_POSTER

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {useEmirateImage ? (
        <img
          src={heroImage}
          alt=""
          className="hero-ken-burns absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
        />
      ) : !reduceMotion ? (
        <HeroVideoRotator poster={poster} />
      ) : (
        <img
          src={poster}
          alt=""
          className="hero-ken-burns absolute inset-0 h-full w-full object-cover"
        />
      )}

      <div className="absolute inset-0 bg-slate-950/60" />
      <div className="hero-gradient-mesh absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/85 via-indigo-900/50 to-violet-950/75" />
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/70 via-transparent to-orange-900/40" />

      <div className="hero-light-sweep absolute inset-0" />
      <div className="hero-perspective-grid absolute inset-0 opacity-25" />
      <div className="hero-dot-grid absolute inset-0 opacity-15" />

      <div className="animate-float absolute -top-24 -left-24 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="animate-float-delayed absolute top-1/4 -right-20 h-96 w-96 rounded-full bg-orange-500/15 blur-3xl" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(15,23,42,0.6)_100%)]" />
      <div className="absolute right-0 bottom-0 left-0 h-48 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent" />
    </div>
  )
}

export function Hero({ heroImage, selectedEmirate }: HeroProps) {
  return (
    <section className="relative min-h-[88vh] overflow-hidden pb-32 pt-28 sm:min-h-[90vh] sm:pb-40 sm:pt-36">
      <HeroBackground heroImage={heroImage} selectedEmirate={selectedEmirate} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="hero-badge mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white/95">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
              </span>
              UAE&apos;s #1 Media Marketplace
              {selectedEmirate && (
                <span className="ml-1 border-l border-white/30 pl-2 text-orange-200">{selectedEmirate}</span>
              )}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl leading-[1.1] font-extrabold tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            Find the Perfect{' '}
            <span className="hero-gradient-text">Media Space</span>
            <br />
            for Your Brand
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl"
          >
            Browse OOH, TV, radio, press, and content creators across the UAE — compare
            options, filter by emirate and budget, and connect with verified media owners
            in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-wrap justify-center gap-2.5"
          >
            {MEDIA_CATEGORIES.map((type, i) => (
              <motion.span
                key={type}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + i * 0.06 }}
                className={`hero-chip hero-chip--${MEDIA_CATEGORY_COLORS[type].chip} px-5 py-2.5 text-sm font-bold tracking-wide text-white`}
              >
                <span className="hero-chip__dot" aria-hidden />
                {MEDIA_CATEGORY_LABELS[type]}
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
          >
            {trustItems.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-sm font-medium text-white/80"
              >
                <CheckCircle2 className="h-4 w-4 text-orange-300" />
                {item}
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-10"
          >
            <a
              href="#search"
              className="hero-cta group inline-flex items-center gap-2.5 rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition-all hover:border-orange-400/60 hover:bg-white/10"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 shadow-lg shadow-orange-500/40 transition-transform group-hover:scale-110">
                <Play className="h-3.5 w-3.5 fill-white text-white" />
              </span>
              Start exploring placements
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
