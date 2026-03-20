'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { formatCurrency } from '@/lib/constants'
import { PackDetail } from './pack-detail'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

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
  reservas_pendientes?: number
}

interface RouteInfo {
  coords: [number, number][]
  distanceKm: number
  durationMin: number
}

// ──────────────────────────────────────────────────────────
// COMPONENTES AUXILIARES DEL MAPA
// ──────────────────────────────────────────────────────────

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

// Función para calcular distancia (Haversine)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radio de la tierra en km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distancia en km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}

// ──────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────────────────

export function MapView({ packs, reservedPackIds = [] }: { packs: PackConUbicacion[], reservedPackIds?: string[] }) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  
  const [selectedPack, setSelectedPack] = useState<PackConUbicacion | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [route, setRoute] = useState<RouteInfo | null>(null)
  
  // Para notificaciones de nuevos packs cercanos
  const prevPacksRef = useRef<string[]>([])
  const isMounted = useRef(false)

  const [localPacks, setLocalPacks] = useState<PackConUbicacion[]>(packs)

  // Sincronizar con el prop del servidor si cambia
  useEffect(() => {
    setLocalPacks(packs)
  }, [packs])

  // 1. Agrupar los packs locales por comercio
  // Solo mostramos los que tienen stock 'real' en tienda superior a 0, 
  // aunque su 'stock visual' pueda ser 0 si están todos reservados.
  const activePacks = localPacks.filter(p => p.estado === 'disponible' && p.cantidad_disponible > 0)
  
  const groupedPacks = activePacks.reduce((acc, pack) => {
    if (!acc[pack.comercio_id]) {
      acc[pack.comercio_id] = {
        comercio_id: pack.comercio_id,
        nombre_comercial: pack.nombre_comercial,
        direccion_texto: pack.direccion_texto,
        lat: pack.lat,
        lng: pack.lng,
        packs: []
      }
    }
    acc[pack.comercio_id].packs.push(pack)
    return acc
  }, {} as Record<string, {
    comercio_id: string
    nombre_comercial: string
    direccion_texto: string
    lat: number
    lng: number
    packs: PackConUbicacion[]
  }>)
  
  const comercios = Object.values(groupedPacks)

  // 2. Suscribirse a nuevos packs globalmente y actualizaciones
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel('packs-changes-cliente')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'packs' }, () => {
        router.refresh()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'packs' }, (payload) => {
        const updated = payload.new as any
        // Actualizar el estado local inmediatamente para ver cambios en vivo (ej. bajó el stock)
        setLocalPacks(prev => prev.map(p => 
          p.id === updated.id 
            ? { ...p, cantidad_disponible: updated.cantidad_disponible, estado: updated.estado } 
            : p
        ))
        router.refresh()
      })
      .subscribe()

    const channelReservas = supabase.channel('reservas-changes-cliente')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reservas' }, (payload) => {
        const nuevaReserva = payload.new as any
        if (nuevaReserva.estado === 'pendiente') {
          // Bloqueo visual instantáneo para otros usuarios
          setLocalPacks(prev => prev.map(p => 
            p.id === nuevaReserva.pack_id 
              ? { ...p, reservas_pendientes: (p.reservas_pendientes || 0) + 1 } 
              : p
          ))
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reservas' }, () => {
        router.refresh()
      })
      .subscribe()
      
    return () => { 
      supabase.removeChannel(channel)
      supabase.removeChannel(channelReservas) 
    }
  }, [router])

  // 3. Detectar si llegó un nuevo pack cercano
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      prevPacksRef.current = packs.map(p => p.id)
      return
    }

    const currentIds = packs.map(p => p.id)
    const newPacks = packs.filter(p => !prevPacksRef.current.includes(p.id))
    
    newPacks.forEach(newPack => {
      let isNearby = true
      
      if (userPos) {
        const dist = getDistanceFromLatLonInKm(userPos[0], userPos[1], newPack.lat, newPack.lng)
        if (dist > 10) {
          isNearby = false
        }
      }

      if (isNearby && newPack.estado === 'disponible') {
        toast.success('¡Nuevo pack disponible cerca de ti!', {
          description: `"${newPack.titulo}" en ${newPack.nombre_comercial}`,
          icon: '🥡',
          duration: 6000
        })
      }
    })
    
    prevPacksRef.current = currentIds
  }, [packs, userPos])

  // Constantes de estilo de mapa
  const tileUrl = resolvedTheme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'

  const defaultCenter: [number, number] = [-0.18, -78.48]

  async function handleShowRoute(lat: number, lng: number) {
    if (!userPos) return
    const routeData = await fetchRoute(userPos[0], userPos[1], lat, lng)
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

        {/* Marcador del usuario */}
        {userPos && (
          <>
            <Circle
              center={userPos}
              radius={120}
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.08, weight: 1 }}
            />
            <Marker position={userPos} icon={userIcon}>
              <Popup><p className="text-sm font-semibold">📍 Tu ubicación</p></Popup>
            </Marker>
          </>
        )}

        {/* Ruta dibujada */}
        {route && (
          <>
            <Polyline
              positions={route.coords}
              pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.8, lineCap: 'round', lineJoin: 'round' }}
            />
            <FitRoute route={route} />
          </>
        )}

        {/* Marcadores de Comercios (Agrupados) */}
        {comercios.map((store) => {
          const totalPacks = store.packs.length
          const storeHash = store.packs.map(p => `${p.id}-${p.cantidad_disponible}`).join('|')
          
          return (
            <Marker
              key={store.comercio_id}
              position={[store.lat, store.lng]}
              icon={packIcon}
            >
              <Popup className="custom-popup" minWidth={260} maxWidth={320}>
                {/* 
                  React key on the wrapper ensures that React unmounts and remounts 
                  the interior HTML when the packs change (live quantity update) 
                  bypassing Leaflet's aggressive caching of Popup contents.
                */}
                <div key={storeHash} className="p-0 animate-in fade-in duration-300">
                  {/* Encabezado del Comercio */}
                  <div className=" mb-2 border-b px-3 py-2 bg-muted/30">
                    <p className=" font-extrabold text-base leading-tight text-foreground">{store.nombre_comercial}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{store.direccion_texto}</p>
                    <div className="mt-1 flex gap-1">
                      <span className="inline-flex items-center rounded-md bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-medium text-emerald-800 dark:text-emerald-300">
                        {totalPacks} pack{totalPacks !== 1 ? 's' : ''} disponible{totalPacks !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Carrusel de Packs */}
                  <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory px-3 pb-3 custom-scrollbar">
                    {store.packs.map((pack) => {
                      const stockVisual = pack.cantidad_disponible - (pack.reservas_pendientes || 0)
                      
                      return (
                      <div
                        key={pack.id}
                        className={`flex flex-col shrink-0 snap-center w-[140px] rounded-lg border bg-card shadow-xs overflow-hidden ${stockVisual <= 0 ? 'opacity-70 grayscale-[0.3]' : ''}`}
                      >
                        {/* Imagen del pack */}
                        <div className="h-20 w-full bg-muted relative">
                          {stockVisual <= 0 && (
                            <div className="absolute inset-0 bg-background/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
                              <span className="bg-background/90 text-foreground text-[10px] font-bold px-2 py-1 rounded shadow-sm border">
                                Reservado
                              </span>
                            </div>
                          )}
                          {pack.foto_url ? (
                            <img src={pack.foto_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground/30 text-xs">
                              Sin imagen
                            </div>
                          )}
                        </div>

                        {/* Detalles */}
                        <div className="p-2 flex flex-col flex-1 justify-between gap-2">
                          <div>
                            <p className="font-bold text-xs text-foreground line-clamp-2 leading-tight">
                              {pack.titulo}
                            </p>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-500 leading-none">
                                {formatCurrency(pack.precio_rescate)}
                              </span>
                              <span className="text-[9px] text-muted-foreground line-through">
                                {formatCurrency(pack.precio_original)}
                              </span>
                            </div>
                            <p className="mt-1 text-[9px] text-muted-foreground line-clamp-1">
                              Stock: <span className={stockVisual <= 0 ? "text-destructive font-medium font-mono" : "font-mono"}>{Math.max(0, stockVisual)}</span>
                            </p>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedPack(pack)
                              setDetailOpen(true)
                            }}
                            className="w-full rounded-md bg-primary py-1.5 text-[10px] font-semibold text-primary-foreground transition hover:bg-primary/90"
                          >
                            Ver detalle
                          </button>
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Banner flotante de ruta */}
      {route && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 rounded-2xl border bg-background/95 backdrop-blur-md px-5 py-3 shadow-xl">
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

      {/* Modal de Detalle */}
      {selectedPack && (
        <PackDetail
          pack={selectedPack}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          userLat={userPos?.[0]}
          userLng={userPos?.[1]}
          onShowRoute={() => {
            handleShowRoute(selectedPack.lat, selectedPack.lng)
            setDetailOpen(false)
          }}
          isAlreadyReserved={reservedPackIds.includes(selectedPack.id)}
        />
      )}
    </>
  )
}
