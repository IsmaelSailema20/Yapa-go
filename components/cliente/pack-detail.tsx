'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Package, ShoppingBag, Copy, CheckCircle2, Clock, Navigation } from 'lucide-react'
import { formatCurrency } from '@/lib/constants'
import { reservarPack } from '@/actions/reservas'
import type { PackConUbicacion } from './map-view'

interface PackDetailProps {
  pack: PackConUbicacion
  open: boolean
  onOpenChange: (open: boolean) => void
  userLat?: number
  userLng?: number
  onShowRoute?: () => void
}

export function PackDetail({ pack, open, onOpenChange, userLat, userLng, onShowRoute }: PackDetailProps) {
  const [reservando, setReservando] = useState(false)
  const [resultado, setResultado] = useState<{
    success?: boolean
    codigoOTP?: string
    mensaje?: string
    error?: string
  } | null>(null)
  const [copiado, setCopado] = useState(false)

  const descuento = Math.round(
    ((pack.precio_original - pack.precio_rescate) / pack.precio_original) * 100
  )

  async function handleReservar() {
    setReservando(true)
    setResultado(null)
    try {
      const res = await reservarPack(pack.id)
      setResultado(res)
    } catch {
      setResultado({ error: 'Error de conexión. Inténtalo de nuevo.' })
    } finally {
      setReservando(false)
    }
  }

  function copiarOTP() {
    if (resultado?.codigoOTP) {
      navigator.clipboard.writeText(resultado.codigoOTP)
      setCopado(true)
      setTimeout(() => setCopado(false), 2000)
    }
  }

  function handleClose(val: boolean) {
    if (!val) {
      setResultado(null)
      setCopado(false)
    }
    onOpenChange(val)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md overflow-hidden p-0 sm:rounded-2xl">
        <DialogTitle className="sr-only">Detalle del pack</DialogTitle>
        <DialogDescription className="sr-only">
          Información completa del pack y opción para reservar
        </DialogDescription>

        {/* Image */}
        <div className="relative h-52 w-full bg-muted overflow-hidden">
          {pack.foto_url ? (
            <img
              src={pack.foto_url}
              alt={pack.titulo}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          <Badge className="absolute top-3 right-3 bg-emerald-500 text-white text-sm px-3 py-1">
            -{descuento}%
          </Badge>
        </div>

        {/* Content */}
        <div className="space-y-5 p-6">
          {/* Commerce info */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-lg leading-tight">{pack.titulo}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{pack.nombre_comercial}</p>
            </div>
          </div>

          {/* Prices */}
          <div className="flex items-center gap-4 rounded-xl bg-muted/60 p-4">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Precio rescate</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(pack.precio_rescate)}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-muted-foreground font-medium">Precio original</p>
              <p className="text-lg text-muted-foreground line-through">{formatCurrency(pack.precio_original)}</p>
            </div>
          </div>

          {/* Details */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{pack.direccion_texto || 'Sin dirección'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{pack.cantidad_disponible} disponibles</span>
            </div>
          </div>

          {/* Route button — shows route on map */}
          {userLat && userLng && onShowRoute && (
            <button
              onClick={onShowRoute}
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
            >
              <Navigation className="h-4 w-4" />
              Cómo llegar
            </button>
          )}

          {/* Reservation result */}
          {resultado?.success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                  ¡Reserva confirmada!
                </p>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white dark:bg-emerald-900 p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Tu código OTP</p>
                  <p className="text-2xl font-mono font-bold tracking-[0.3em]">
                    {resultado.codigoOTP}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-lg"
                  onClick={copiarOTP}
                >
                  {copiado ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Muestra este código al retirar tu pack en el comercio.
              </p>
            </div>
          )}

          {resultado?.error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">{resultado.error}</p>
            </div>
          )}

          {/* Action button */}
          {!resultado?.success && (
            <Button
              className="w-full h-12 text-base font-medium rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
              onClick={handleReservar}
              disabled={reservando || pack.cantidad_disponible <= 0}
            >
              {reservando
                ? 'Reservando...'
                : pack.cantidad_disponible <= 0
                  ? 'Agotado'
                  : 'Reservar Pack'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
