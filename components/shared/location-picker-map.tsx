'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface LocationPickerMapProps {
  lat: number
  lng: number
  onLocationChange: (lat: number, lng: number) => void
}

function ClickHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function FlyToUser({ onLocationChange, hasManualPick }: { onLocationChange: (lat: number, lng: number) => void; hasManualPick: boolean }) {
  const map = useMap()

  useEffect(() => {
    if (hasManualPick) return
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          map.flyTo([latitude, longitude], 16, { duration: 1.5 })
          onLocationChange(latitude, longitude)
        },
        () => { /* keep default */ }
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  return null
}

export function LocationPickerMap({ lat, lng, onLocationChange }: LocationPickerMapProps) {
  const [hasManualPick, setHasManualPick] = useState(false)

  function handleChange(newLat: number, newLng: number) {
    setHasManualPick(true)
    onLocationChange(newLat, newLng)
  }

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      className="h-full w-full rounded-xl"
      style={{ minHeight: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <ClickHandler onLocationChange={handleChange} />
      <FlyToUser onLocationChange={onLocationChange} hasManualPick={hasManualPick} />
      <Marker position={[lat, lng]} icon={redIcon} />
    </MapContainer>
  )
}
