'use client'

import dynamic from 'next/dynamic'
import type { PackConUbicacion } from './map-view'

const MapView = dynamic(
  () => import('@/components/cliente/map-view').then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-muted">
        <div className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-primary/20" />
          <p className="text-sm text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    ),
  }
)

export function MapWrapper({ packs, reservedPackIds = [] }: { packs: PackConUbicacion[], reservedPackIds?: string[] }) {
  return <MapView packs={packs} reservedPackIds={reservedPackIds} />
}
