import { createClient } from '@/lib/supabase/server'
import { MapWrapper } from '@/components/cliente/map-wrapper'

/**
 * Parsea un string WKB hex (Well-Known Binary) de un Point con SRID
 * que Supabase devuelve para columnas de tipo geography/geometry.
 * Formato: 01 01000020 E6100000 [8 bytes lng] [8 bytes lat]
 */
function parseWKBPoint(hex: string): { lat: number; lng: number } | null {
  if (!hex || hex.length < 42) return null

  try {
    const buf = Buffer.from(hex, 'hex')
    const isLE = buf[0] === 1

    let offset = 1
    // Geometry type (4 bytes)
    const geomType = isLE ? buf.readUInt32LE(offset) : buf.readUInt32BE(offset)
    offset += 4

    // Skip SRID if present (flag 0x20000000)
    if (geomType & 0x20000000) {
      offset += 4
    }

    // X = longitude, Y = latitude
    const lng = isLE ? buf.readDoubleLE(offset) : buf.readDoubleBE(offset)
    offset += 8
    const lat = isLE ? buf.readDoubleLE(offset) : buf.readDoubleBE(offset)

    return { lat, lng }
  } catch {
    return null
  }
}

export default async function ClienteMarketplacePage() {
  const supabase = await createClient()

  // Query directa con join a comercios
  const { data: packs } = await supabase
    .from('packs')
    .select(`
      id,
      titulo,
      precio_original,
      precio_rescate,
      foto_url,
      cantidad_disponible,
      estado,
      comercio_id,
      comercios (
        nombre_comercial,
        direccion_texto,
        ubicacion
      )
    `)
    .eq('estado', 'disponible')
    .gt('cantidad_disponible', 0)

  // Obtener TODAS las reservas pendientes para calcular el "stock visual" (soft-lock)
  const { data: todasReservas } = await supabase
    .from('reservas')
    .select('pack_id')
    .eq('estado', 'pendiente')

  const countPendientes = (todasReservas || []).reduce((acc: Record<string, number>, r) => {
    acc[r.pack_id] = (acc[r.pack_id] || 0) + 1
    return acc
  }, {})

  const packsConUbicacion = (packs ?? [])
    .filter((p: any) => p.comercios?.ubicacion)
    .map((p: any) => {
      const ubicacion = p.comercios.ubicacion
      let coords: { lat: number; lng: number } | null = null

      if (typeof ubicacion === 'string') {
        // WKB hex (lo que devuelve Supabase para geography)
        coords = parseWKBPoint(ubicacion)

        // Fallback: WKT POINT(lng lat)
        if (!coords) {
          const match = ubicacion.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/)
          if (match) {
            coords = { lng: parseFloat(match[1]), lat: parseFloat(match[2]) }
          }
        }
      } else if (typeof ubicacion === 'object' && ubicacion?.coordinates) {
        coords = { lng: ubicacion.coordinates[0], lat: ubicacion.coordinates[1] }
      }

      if (!coords) return null

      return {
        id: p.id,
        titulo: p.titulo,
        precio_original: p.precio_original,
        precio_rescate: p.precio_rescate,
        foto_url: p.foto_url,
        cantidad_disponible: p.cantidad_disponible,
        estado: p.estado,
        comercio_id: p.comercio_id,
        nombre_comercial: p.comercios.nombre_comercial ?? 'Comercio',
        direccion_texto: p.comercios.direccion_texto ?? '',
        lat: coords.lat,
        lng: coords.lng,
        reservas_pendientes: countPendientes[p.id] || 0,
      }
    })
    .filter(Boolean)

  // Obtener los packs que el cliente ya tiene reservados (pendientes)
  const { data: { user } } = await supabase.auth.getUser()
  let reservedPackIds: string[] = []
  
  if (user) {
    const { data: reservas } = await supabase
      .from('reservas')
      .select('pack_id')
      .eq('cliente_id', user.id)
      .eq('estado', 'pendiente')
      
    if (reservas) {
      reservedPackIds = reservas.map(r => r.pack_id)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-4.5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-1 py-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Marketplace</h1>
          <p className="text-sm text-muted-foreground">
            {packsConUbicacion.length} pack{packsConUbicacion.length !== 1 ? 's' : ''} disponible{packsConUbicacion.length !== 1 ? 's' : ''} cerca de ti
          </p>
        </div>
      </div>

      {/* Map */}
      <div className="relative z-0 flex-1 min-h-0 overflow-hidden rounded-2xl border shadow-sm">
        <MapWrapper packs={packsConUbicacion as any} reservedPackIds={reservedPackIds} />
      </div>
    </div>
  )
}
