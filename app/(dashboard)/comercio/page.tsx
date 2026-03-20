import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/constants'
import { Package, Clock, TrendingUp, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function ComercioDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch KPIs
  const { data: packs } = await supabase
    .from('packs')
    .select('id, precio_original, precio_rescate, costo_produccion, estado, cantidad_disponible')
    .eq('comercio_id', user!.id)

  const { data: reservas } = await supabase
    .from('reservas')
    .select('id, estado, pack_id')
    .in('pack_id', (packs ?? []).map(p => p.id))

  const packsActivos = (packs ?? []).filter(p => p.estado === 'disponible').length
  const reservasPendientes = (reservas ?? []).filter(r => r.estado === 'pendiente').length

  // Recuperación de Costos =
  // Por cada reserva entregada: precio_rescate (dinero que entró a caja)
  // Si no se hubiera vendido, ese ingreso habría sido $0.
  const recuperacionTotal = (reservas ?? [])
    .filter(r => r.estado === 'entregado')
    .reduce((total, r) => {
      const pack = (packs ?? []).find(p => p.id === r.pack_id)
      return total + (pack?.precio_rescate ?? 0)
    }, 0)

  const kpis = [
    {
      label: 'Packs Activos',
      value: packsActivos.toString(),
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Reservas Pendientes',
      value: reservasPendientes.toString(),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-950',
    },
    {
      label: 'Recuperación de Costos',
      value: formatCurrency(recuperacionTotal),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-950',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Resumen de tu actividad en YapaSegura.</p>
        </div>
        <Link
          href="/comercio/packs/nuevo"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl"
        >
          <Plus className="h-4 w-4" />
          Nuevo Pack
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${kpi.bgColor}`}>
              <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground truncate">{kpi.label}</p>
              <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Packs */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Últimos Packs</h2>
          <Link href="/comercio/packs" className="text-sm text-primary font-medium hover:underline">
            Ver todos →
          </Link>
        </div>
        {(!packs || packs.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground font-medium">No tienes packs todavía</p>
            <p className="text-sm text-muted-foreground mt-1">Crea tu primer pack y empieza a rescatar excedentes.</p>
            <Link
              href="/comercio/packs/nuevo"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <Plus className="h-4 w-4" />
              Crear Pack
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {packs.slice(0, 5).map((pack) => (
              <div key={pack.id} className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-muted/50">
                <div className="min-w-0">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    pack.estado === 'disponible' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                    : pack.estado === 'agotado' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                  }`}>
                    {pack.estado}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(pack.precio_rescate)}</p>
                  <p className="text-xs text-muted-foreground">{pack.cantidad_disponible} disponibles</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
