import { createClient } from '@/lib/supabase/server'
import { ReportesCharts } from '@/components/comercio/reportes-charts'

export default async function ComercioReportesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Traer todos los packs del comercio
  const { data: packs } = await supabase
    .from('packs')
    .select('id, titulo, precio_original, precio_rescate, estado, created_at')
    .eq('comercio_id', user.id)

  const packsIds = (packs ?? []).map((p) => p.id)

  // Traer todas las reservas asociadas a esos packs
  const { data: reservas } = await supabase
    .from('reservas')
    .select('id, pack_id, estado, fecha_reserva')
    .in('pack_id', packsIds.length > 0 ? packsIds : ['00000000-0000-0000-0000-000000000000'])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reportes y Estadísticas</h1>
        <p className="text-muted-foreground mt-1">Analiza el rendimiento de tus rescates y tu impacto ambiental.</p>
      </div>
      
      {/* Client Component para interactividad y gráficos */}
      <ReportesCharts packs={packs ?? []} reservas={reservas ?? []} />
    </div>
  )
}
