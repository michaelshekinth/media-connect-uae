import { useState } from 'react'

export function AgencyGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0)

  return (
    <div>
      <div className="overflow-hidden rounded-2xl">
        <img src={images[active]} alt={`${name} gallery ${active + 1}`} className="h-64 w-full object-cover sm:h-80" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button key={i} type="button" onClick={() => setActive(i)}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${i === active ? 'border-indigo-500' : 'border-transparent opacity-70 hover:opacity-100'}`}>
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
