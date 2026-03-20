import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Package, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { ReservaActions } from '@/components/cliente/reserva-actions'
import { ReservaRealtimeListener } from '@/components/cliente/reserva-realtime-listener'

export default async function ClienteReservasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: reservas } = await supabase
    .from('reservas')
    .select(`
      id,
      codigo_otp,
      estado,
      packs (
        titulo,
        precio_rescate,
        foto_url,
        comercio_id,
        comercios (
          nombre_comercial
        )
      )
    `)
    .eq('cliente_id', user!.id)
    .order('estado', { ascending: true })

  const estadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return (
          <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 border-0">
            <Clock className="h-3 w-3 mr-1" /> Pendiente
          </Badge>
        )
      case 'entregado':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Entregado
          </Badge>
        )
      case 'cancelado':
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-0">
            <XCircle className="h-3 w-3 mr-1" /> Cancelado
          </Badge>
        )
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Realtime listener — shows celebration modal on delivery */}
      <ReservaRealtimeListener userId={user!.id} />
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mis Reservas</h1>
        <p className="text-muted-foreground mt-1">
          Historial de tus packs reservados y códigos OTP.
        </p>
      </div>

      {(!reservas || reservas.length === 0) ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-16 text-center shadow-sm">
          <Package className="h-16 w-16 text-muted-foreground/30 mb-6" />
          <p className="text-lg font-semibold text-muted-foreground">Sin reservas todavía</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Explora el mapa para encontrar packs de comida y hacer tu primera reserva.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reservas.map((r: any) => (
            <div
              key={r.id}
              className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Image */}
              <div className="relative h-36 w-full bg-muted overflow-hidden">
                {r.packs?.foto_url ? (
                  <img
                    src={r.packs.foto_url}
                    alt={r.packs.titulo}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-3 left-3">{estadoBadge(r.estado)}</div>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-base truncate">{r.packs?.titulo ?? 'Pack'}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r.packs?.comercios?.nombre_comercial ?? 'Comercio'}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(r.packs?.precio_rescate ?? 0)}
                  </span>
                </div>

                {/* OTP code for pending reservations */}
                {r.estado === 'pendiente' && (
                  <div className="rounded-xl bg-muted/60 p-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Tu código OTP</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-mono font-bold tracking-[0.3em]">
                        {r.codigo_otp}
                      </span>
                      <ReservaActions reservaId={r.id} codigoOTP={r.codigo_otp} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Muestra este código al retirar tu pack.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
