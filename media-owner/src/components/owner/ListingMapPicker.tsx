import L from 'leaflet'
import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { CITY_CONFIGS } from '@shared/constants'
import type { City } from '@shared/types'

const pinIcon = L.divIcon({
  className: 'agency-map-pin',
  html: `<div class="agency-map-pin-dot"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
})

function MapFlyTo({ emirate }: { emirate: string }) {
  const map = useMap()
  useEffect(() => {
    if (emirate in CITY_CONFIGS) {
      const config = CITY_CONFIGS[emirate as keyof typeof CITY_CONFIGS]
      map.flyTo([config.lat, config.lng], config.zoom, { duration: 0.8 })
    }
  }, [map, emirate])
  return null
}

function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

interface ListingMapPickerProps {
  emirate: City
  lat: number
  lng: number
  onChange: (lat: number, lng: number) => void
}

export function ListingMapPicker({ emirate, lat, lng, onChange }: ListingMapPickerProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-500">Click the map to set the placement pin</p>
      <div className="h-64 overflow-hidden rounded-2xl border border-slate-200 sm:h-72">
        <MapContainer center={[lat, lng]} zoom={12} className="h-full w-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapFlyTo emirate={emirate} />
          <MapClickHandler onPick={onChange} />
          <Marker position={[lat, lng]} icon={pinIcon} />
        </MapContainer>
      </div>
      <p className="text-xs text-slate-500">
        Coordinates: {lat.toFixed(5)}, {lng.toFixed(5)}
      </p>
    </div>
  )
}
