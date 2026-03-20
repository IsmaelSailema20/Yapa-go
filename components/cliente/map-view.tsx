'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { formatCurrency } from '@/lib/constants'
import { PackDetail } from './pack-detail'
import { useTheme } from 'next-themes'

// Fix default Leaflet marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom green marker for packs
const packIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Blue pulsing dot for user location
const userIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:22px;height:22px;">
      <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.25);animation:pulse-ring 1.5s ease-out infinite;"></div>
      <div style="position:absolute;top:5px;left:5px;width:12px;height:12px;border-radius:50%;background:#3b82f6;border:2.5px solid white;box-shadow:0 0 6px rgba(59,130,246,0.5);"></div>
    </div>
    <style>
      @keyframes pulse-ring {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(2.2); opacity: 0; }
      }
    </style>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

export interface PackConUbicacion {
  id: string
  titulo: string
  precio_original: number
  precio_rescate: number
  foto_url: string | null
  cantidad_disponible: number
  estado: string
  comercio_id: string
  nombre_comercial: string
  direccion_texto: string
  lat: number
  lng: number
}

interface RouteInfo {
  coords: [number, number][]
  distanceKm: number
  durationMin: number
}

function UserLocationTracker({ onLocationFound }: { onLocationFound: (lat: number, lng: number) => void }) {
  const map = useMap()

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          map.flyTo([latitude, longitude], 14, { duration: 1.5 })
          onLocationFound(latitude, longitude)
        },
        () => {
          map.flyTo([-0.18, -78.48], 13, { duration: 1 })
        }
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  return null
}

// Fit map bounds to show the full route
function FitRoute({ route }: { route: RouteInfo }) {
  const map = useMap()

  useEffect(() => {
    if (route.coords.length > 0) {
      const bounds = L.latLngBounds(route.coords)
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 })
    }
  }, [map, route])

  return null
}

async function fetchRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<RouteInfo | null> {
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`
    )
    const data = await res.json()

    if (data.code !== 'Ok' || !data.routes?.[0]) return null

    const route = data.routes[0]
    const coords: [number, number][] = route.geometry.coordinates.map(
      (c: [number, number]) => [c[1], c[0]] // GeoJSON is [lng,lat], Leaflet is [lat,lng]
    )

    return {
      coords,
      distanceKm: Math.round((route.distance / 1000) * 10) / 10,
      durationMin: Math.round(route.duration / 60),
    }
  } catch {
    return null
  }
}

export function MapView({ packs }: { packs: PackConUbicacion[] }) {
  const [selectedPack, setSelectedPack] = useState<PackConUbicacion | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [route, setRoute] = useState<RouteInfo | null>(null)
  const { resolvedTheme } = useTheme()

  const tileUrl = resolvedTheme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'

  const defaultCenter: [number, number] = [-0.18, -78.48]

  async function handleShowRoute(pack: PackConUbicacion) {
    if (!userPos) return
    const routeData = await fetchRoute(userPos[0], userPos[1], pack.lat, pack.lng)
    if (routeData) {
      setRoute(routeData)
    }
  }

  function handleCloseRoute() {
    setRoute(null)
  }

  return (
    <>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        className="h-full w-full rounded-2xl"
        style={{ minHeight: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url={tileUrl}
          key={tileUrl}
        />
        <UserLocationTracker onLocationFound={(lat, lng) => setUserPos([lat, lng])} />

        {/* User location marker */}
        {userPos && (
          <>
            <Circle
              center={userPos}
              radius={120}
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.08,
                weight: 1,
              }}
            />
            <Marker position={userPos} icon={userIcon}>
              <Popup>
                <p className="text-sm font-semibold">📍 Tu ubicación</p>
              </Popup>
            </Marker>
          </>
        )}

        {/* Route polyline */}
        {route && (
          <>
            <Polyline
              positions={route.coords}
              pathOptions={{
                color: '#3b82f6',
                weight: 5,
                opacity: 0.8,
                dashArray: undefined,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            <FitRoute route={route} />
          </>
        )}

        {/* Pack markers */}
        {packs.map((pack) => (
          <Marker
            key={pack.id}
            position={[pack.lat, pack.lng]}
            icon={packIcon}
            eventHandlers={{
              click: () => {
                setSelectedPack(pack)
                setDetailOpen(true)
              },
            }}
          >
            <Popup>
              <div className="min-w-[200px] p-1">
                <p className="font-bold text-sm">{pack.nombre_comercial}</p>
                <p className="text-xs text-gray-600 mt-0.5">{pack.titulo}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-sm font-bold text-green-600">
                    {formatCurrency(pack.precio_rescate)}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    {formatCurrency(pack.precio_original)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {pack.cantidad_disponible} disponible{pack.cantidad_disponible !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={() => {
                    setSelectedPack(pack)
                    setDetailOpen(true)
                  }}
                  className="mt-2 w-full rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-700"
                >
                  Ver detalle
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Route info banner */}
      {route && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 rounded-2xl border bg-background/95 backdrop-blur-md px-5 py-3 shadow-xl">
          <div className="text-sm">
            <span className="font-bold text-primary">{route.distanceKm} km</span>
            <span className="mx-1.5 text-muted-foreground">·</span>
            <span className="font-medium">{route.durationMin} min</span>
          </div>
          <button
            onClick={handleCloseRoute}
            className="ml-2 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium hover:bg-muted/80 transition-colors"
          >
            Cerrar ruta
          </button>
        </div>
      )}

      {selectedPack && (
        <PackDetail
          pack={selectedPack}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          userLat={userPos?.[0]}
          userLng={userPos?.[1]}
          onShowRoute={() => {
            handleShowRoute(selectedPack)
            setDetailOpen(false)
          }}
        />
      )}
    </>
  )
}
