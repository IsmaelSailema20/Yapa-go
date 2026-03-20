'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Copy, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { cancelarReserva } from '@/actions/reservas'
import { useRouter } from 'next/navigation'

interface ReservaActionsProps {
  reservaId: string
  codigoOTP: string
}

export function ReservaActions({ reservaId, codigoOTP }: ReservaActionsProps) {
  const router = useRouter()
  const [copiado, setCopado] = useState(false)
  const [cancelando, setCancelando] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  function copiarOTP() {
    navigator.clipboard.writeText(codigoOTP)
    setCopado(true)
    setTimeout(() => setCopado(false), 2000)
  }

  async function handleCancelar() {
    setCancelando(true)
    await cancelarReserva(reservaId)
    setShowConfirm(false)
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={copiarOTP}
          title="Copiar código"
        >
          {copiado ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
          onClick={() => setShowConfirm(true)}
          disabled={cancelando}
          title="Cancelar reserva"
        >
          <XCircle className="h-4 w-4" />
        </Button>
      </div>

      {/* Confirmation modal */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-sm sm:rounded-2xl">
          <DialogTitle className="sr-only">Confirmar cancelación</DialogTitle>
          <DialogDescription className="sr-only">
            Confirma si deseas cancelar esta reserva
          </DialogDescription>

          <div className="flex flex-col items-center text-center space-y-4 py-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold">¿Cancelar reserva?</h3>
              <p className="text-sm text-muted-foreground max-w-[260px]">
                Tu código OTP <span className="font-mono font-bold">{codigoOTP}</span> será invalidado y el pack volverá a estar disponible.
              </p>
            </div>
            <div className="flex gap-3 w-full pt-1">
              <Button
                variant="outline"
                className="flex-1 h-11 rounded-xl"
                onClick={() => setShowConfirm(false)}
                disabled={cancelando}
              >
                No, mantener
              </Button>
              <Button
                variant="destructive"
                className="flex-1 h-11 rounded-xl"
                onClick={handleCancelar}
                disabled={cancelando}
              >
                {cancelando ? 'Cancelando...' : 'Sí, cancelar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
