'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle2, PartyPopper, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EntregaInfo {
  pack_titulo: string
}

export function ReservaRealtimeListener({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [entrega, setEntrega] = useState<EntregaInfo | null>(null)

  useEffect(() => {
    const channel = supabase
      .channel(`reservas-cliente-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reservas',
          filter: `cliente_id=eq.${userId}`,
        },
        async (payload) => {
          const updated = payload.new as any
          if (updated.estado === 'entregado') {
            // Fetch pack title for the message
            const { data: pack } = await supabase
              .from('packs')
              .select('titulo')
              .eq('id', updated.pack_id)
              .single()

            setEntrega({ pack_titulo: pack?.titulo ?? 'tu pack' })
            router.refresh() // refresh reservation list
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  if (!entrega) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" />

      {/* Modal */}
      <div className="fixed inset-0 z-[2001] flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm rounded-3xl bg-background shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
          {/* Gradient header */}
          <div className="h-2 bg-linear-to-r from-emerald-400 via-primary to-emerald-400 bg-size-[200%_auto] animate-gradient" />

          <div className="p-8 text-center space-y-5">
            {/* Icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
              <PartyPopper className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>

            {/* Text */}
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold tracking-tight">¡Buen Provecho!</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Tu pack <span className="font-semibold text-foreground">"{entrega.pack_titulo}"</span> fue
                entregado exitosamente. ¡Gracias por ayudar a reducir el desperdicio de alimentos! 🌱
              </p>
            </div>

            {/* Checkmark row */}
            <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                Recolección completada
              </p>
            </div>

            {/* Close button */}
            <Button
              className="w-full h-12 rounded-xl text-base font-medium"
              onClick={() => setEntrega(null)}
            >
              ¡Genial!
            </Button>
          </div>

          {/* Close X */}
          <button
            onClick={() => setEntrega(null)}
            className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  )
}
