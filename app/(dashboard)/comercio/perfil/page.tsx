import { createClient } from '@/lib/supabase/server'
import { PerfilComercioForm } from '@/components/comercio/perfil-form'
import { redirect } from 'next/navigation'

/**
 * Parsea un string WKB hex (Well-Known Binary) de un Point con SRID
 * que Supabase devuelve para columnas de tipo geography/geometry.
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

export default async function ComercioPerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Obtener perfil base
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!perfil) return <p>Perfil no encontrado.</p>

  // Obtener datos del comercio
  const { data: registroComercio } = await supabase
    .from('comercios')
    .select('*')
    .eq('id', user.id)
    .single()

  // Parsear ubicación si existe
  let comercioData = { ...registroComercio, lat: null as number | null, lng: null as number | null }
  if (registroComercio?.ubicacion) {
    const coords = parseWKBPoint(registroComercio.ubicacion)
    if (coords) {
      comercioData.lat = coords.lat
      comercioData.lng = coords.lng
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mi Comercio</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona los datos de contacto y la ubicación de tu local.
        </p>
      </div>

      <PerfilComercioForm perfil={perfil} comercio={comercioData} />
    </div>
  )
}
