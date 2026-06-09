import L from 'leaflet'
import { MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {
  CITY_CONFIGS,
  UAE_CITIES,
  UAE_MAP_CENTER,
  UAE_MAP_ZOOM,
} from '@shared/constants'
import { fetchAgencies } from '../../services/userStore'
import type { Agency } from '@shared/types'

const orangePinIcon = L.divIcon({
  className: 'agency-map-pin',
  html: `<div class="agency-map-pin-dot"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
})

interface FeaturedLocationsProps {
  selectedCity: string | null
  onCitySelect: (city: string | null) => void
}

function MapFlyTo({ selectedCity }: { selectedCity: string | null }) {
  const map = useMap()

  useEffect(() => {
    if (selectedCity && selectedCity in CITY_CONFIGS) {
      const config = CITY_CONFIGS[selectedCity as keyof typeof CITY_CONFIGS]
      map.flyTo([config.lat, config.lng], config.zoom, { duration: 1 })
    } else {
      map.flyTo([UAE_MAP_CENTER.lat, UAE_MAP_CENTER.lng], UAE_MAP_ZOOM, {
        duration: 1,
      })
    }
  }, [map, selectedCity])

  return null
}

function OpenStreetMapView({
  agencies,
  selectedCity,
}: {
  agencies: Agency[]
  selectedCity: string | null
}) {
  const visibleAgencies =
    selectedCity && selectedCity !== 'All UAE'
      ? agencies.filter((a) => a.city === selectedCity)
      : agencies

  return (
    <div className="relative h-[380px] w-full overflow-hidden rounded-2xl sm:h-[420px]">
      <MapContainer
        center={[UAE_MAP_CENTER.lat, UAE_MAP_CENTER.lng]}
        zoom={UAE_MAP_ZOOM}
        scrollWheelZoom={false}
        className="h-full w-full rounded-2xl"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFlyTo selectedCity={selectedCity} />
        {visibleAgencies.map((agency) => (
          <Marker
            key={agency.id}
            position={[agency.lat, agency.lng]}
            icon={orangePinIcon}
          >
            <Popup>
              <div className="min-w-[160px] p-1">
                <p className="font-bold text-slate-900">{agency.name}</p>
                <p className="text-sm text-slate-600">{agency.city}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {agency.mediaTypes.join(' · ')} · {agency.listingCount}{' '}
                  listings
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="pointer-events-none absolute top-4 left-4 z-[1000]">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-md">
          <MapPin className="h-4 w-4 text-orange-500" />
          UAE Inventory Map · {visibleAgencies.length} pins
        </span>
      </div>
    </div>
  )
}

export function FeaturedLocations({
  selectedCity,
  onCitySelect,
}: FeaturedLocationsProps) {
  const [agencies, setAgencies] = useState<Agency[]>([])

  useEffect(() => {
    fetchAgencies().then((data) => setAgencies(data as Agency[])).catch(() => setAgencies([]))
  }, [])

  const handleCityClick = (city: string) => {
    onCitySelect(selectedCity === city ? null : city)
  }

  return (
    <section id="locations" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Featured Locations
          </h2>
          <p className="mt-2 text-slate-500">
            Explore agency inventory across all seven emirates
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <OpenStreetMapView
            agencies={agencies}
            selectedCity={selectedCity}
          />

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {UAE_CITIES.map((city) => {
              const isActive = selectedCity === city
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleCityClick(city)}
                  className={`flex flex-col items-center rounded-xl border p-4 transition-all ${
                    isActive
                      ? 'border-orange-400 bg-orange-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-orange-200 hover:shadow-sm'
                  }`}
                >
                  <MapPin
                    className={`mb-2 h-5 w-5 ${isActive ? 'text-orange-600' : 'text-orange-500'}`}
                  />
                  <span
                    className={`text-sm font-bold ${isActive ? 'text-orange-800' : 'text-slate-800'}`}
                  >
                    {city}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
