import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Package, Clock, CheckCircle2, XCircle, ScanLine } from 'lucide-react'
import { OTPValidator } from '@/components/comercio/otp-validator'

export default async function ComercioReservasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all reservations for packs belonging to this commerce
  const { data: reservas } = await supabase
    .from('reservas')
    .select(`
      id,
      codigo_otp,
      estado,
      packs (
        id,
        titulo,
        precio_rescate,
        foto_url,
        comercio_id
      ),
      perfiles (
        nombre_completo,
        email
      )
    `)
    .order('estado', { ascending: true })

  // Filter to only this commerce's packs
  const misReservas = (reservas ?? []).filter(
    (r: any) => r.packs?.comercio_id === user?.id
  )

  const pendientes = misReservas.filter((r: any) => r.estado === 'pendiente')
  const historial = misReservas.filter((r: any) => r.estado !== 'pendiente')

  const estadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return (
          <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 border-0 gap-1">
            <Clock className="h-3 w-3" /> Pendiente
          </Badge>
        )
      case 'entregado':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0 gap-1">
            <CheckCircle2 className="h-3 w-3" /> Entregado
          </Badge>
        )
      case 'cancelado':
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-0 gap-1">
            <XCircle className="h-3 w-3" /> Cancelado
          </Badge>
        )
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reservas</h1>
        <p className="text-muted-foreground mt-1">
          Validación de códigos OTP e historial de entregas.
        </p>
      </div>

      {/* OTP Validator Panel */}
      <div className="rounded-3xl border bg-card shadow-sm overflow-hidden">
        <div className="h-1.5 bg-linear-to-r from-primary via-secondary to-primary bg-size-[200%_auto] animate-gradient" />
        <div className="p-6 sm:p-8 space-y-2">
          <div className="flex items-center gap-2 mb-6">
            <ScanLine className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Validar Código OTP</h2>
          </div>
          <OTPValidator />
        </div>
      </div>

      {/* Pending Reservations */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Reservas Pendientes</h2>
          {pendientes.length > 0 && (
            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 border-0">
              {pendientes.length}
            </Badge>
          )}
        </div>

        {pendientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-10 text-center shadow-sm">
            <Clock className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Sin reservas pendientes</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pendientes.map((r: any) => (
              <div key={r.id} className="flex gap-3 rounded-2xl border bg-card p-4 shadow-sm">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {r.packs?.foto_url ? (
                    <img src={r.packs.foto_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{r.packs?.titulo ?? 'Pack'}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {(r.perfiles as any)?.nombre_completo || (r.perfiles as any)?.email || 'Cliente'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {estadoBadge(r.estado)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      {historial.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Historial</h2>
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <div className="divide-y">
              {historial.map((r: any) => (
                <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {r.packs?.foto_url ? (
                      <img src={r.packs.foto_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{r.packs?.titulo ?? 'Pack'}</p>
                    <p className="text-xs text-muted-foreground">
                      {(r.perfiles as any)?.nombre_completo || (r.perfiles as any)?.email || 'Cliente'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      {formatCurrency(r.packs?.precio_rescate ?? 0)}
                    </span>
                    {estadoBadge(r.estado)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
