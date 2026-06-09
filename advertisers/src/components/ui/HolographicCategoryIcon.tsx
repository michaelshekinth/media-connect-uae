import type { LucideIcon } from 'lucide-react'

type HoloVariant = 'indigo' | 'violet' | 'blue' | 'emerald' | 'orange'

interface HolographicCategoryIconProps {
  icon: LucideIcon
  variant: HoloVariant
}

export function HolographicCategoryIcon({
  icon: Icon,
  variant,
}: HolographicCategoryIconProps) {
  return (
    <div className={`holo-icon holo-icon--${variant} mb-5`}>
      <div className="holo-icon__aura" aria-hidden />
      <div className="holo-icon__ring" aria-hidden />
      <div className="holo-icon__body">
        <div className="holo-icon__base" aria-hidden />
        <div className="holo-icon__hologram" aria-hidden />
        <div className="holo-icon__gloss" aria-hidden />
        <div className="holo-icon__edge" aria-hidden />
        <Icon className="holo-icon__svg" strokeWidth={1.75} />
      </div>
    </div>
  )
}
