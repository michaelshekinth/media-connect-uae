import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const pinIcon = L.divIcon({
  className: 'agency-map-pin',
  html: `<div class="agency-map-pin-dot"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
})

interface AgencyMapProps {
  lat: number
  lng: number
  name: string
  address: string
}

export function AgencyMap({ lat, lng, name, address }: AgencyMapProps) {
  return (
    <div className="h-64 overflow-hidden rounded-2xl border border-slate-200 sm:h-80">
      <MapContainer center={[lat, lng]} zoom={13} className="h-full w-full" scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={pinIcon}>
          <Popup>
            <strong>{name}</strong>
            <br />
            {address}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
