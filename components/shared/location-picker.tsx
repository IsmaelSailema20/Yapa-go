'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin } from 'lucide-react'

const LocationPickerMap = dynamic(
  () => import('@/components/shared/location-picker-map').then((mod) => mod.LocationPickerMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-xl bg-muted">
        <div className="text-center space-y-2">
          <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-primary/20" />
          <p className="text-xs text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    ),
  }
)

export function LocationPicker() {
  const [lat, setLat] = useState(-0.180653)
  const [lng, setLng] = useState(-78.467838)

  function handleLocationChange(newLat: number, newLng: number) {
    setLat(newLat)
    setLng(newLng)
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-4">
      <div className="flex items-center justify-center gap-2 text-primary font-semibold">
        <MapPin className="h-5 w-5" />
        <span>Selecciona tu Ubicación</span>
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Haz clic en el mapa para marcar la ubicación exacta de tu comercio.
      </p>

      {/* Map */}
      <div className="h-64 sm:h-72 w-full overflow-hidden rounded-xl border">
        <LocationPickerMap lat={lat} lng={lng} onLocationChange={handleLocationChange} />
      </div>

      {/* Hidden inputs for form submission */}
      <input type="hidden" name="lat" value={lat} />
      <input type="hidden" name="lng" value={lng} />

      {/* Coordinate display */}
      <div className="flex gap-4 max-w-md mx-auto">
        <div className="flex-1 space-y-2 text-left">
          <Label className="text-xs text-muted-foreground uppercase">Latitud</Label>
          <Input
            readOnly
            value={lat.toFixed(6)}
            className="bg-white/50 dark:bg-black/50 border-none text-sm font-mono"
          />
        </div>
        <div className="flex-1 space-y-2 text-left">
          <Label className="text-xs text-muted-foreground uppercase">Longitud</Label>
          <Input
            readOnly
            value={lng.toFixed(6)}
            className="bg-white/50 dark:bg-black/50 border-none text-sm font-mono"
          />
        </div>
      </div>
    </div>
  )
}
