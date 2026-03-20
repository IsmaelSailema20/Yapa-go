'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell } from 'lucide-react'
import { marcarTodasLeidas } from '@/actions/notificaciones'
import { useRouter } from 'next/navigation'

interface Notificacion {
  id: string
  titulo: string
  mensaje: string
  tipo: string
  leida: boolean
}

export function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter()
  const [notifs, setNotifs] = useState<Notificacion[]>([])
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  // Initial fetch
  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('notificaciones')
        .select('id, titulo, mensaje, tipo, leida')
        .eq('usuario_id', userId)
        .eq('leida', false)
        .order('id', { ascending: false })
        .limit(10)
      setNotifs(data ?? [])
    }
    fetch()
  }, [userId])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`notifs-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones',
          filter: `usuario_id=eq.${userId}`,
        },
        (payload) => {
          setNotifs((prev) => [payload.new as Notificacion, ...prev])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])

  const unread = notifs.filter((n) => !n.leida).length

  async function handleOpen() {
    setOpen(!open)
    if (!open && unread > 0) {
      await marcarTodasLeidas()
      setNotifs((prev) => prev.map((n) => ({ ...n, leida: true })))
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border bg-muted/50 transition-colors hover:bg-muted"
        aria-label="Notificaciones"
      >
        <Bell className="h-4.5 w-4.5" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Panel */}
          <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border bg-background shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <p className="font-semibold text-sm">Notificaciones</p>
              {notifs.length > 0 && (
                <button
                  onClick={() => setNotifs([])}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">Sin notificaciones</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifs.map((n) => (
                    <div key={n.id} className="p-4 space-y-0.5">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 text-base">
                          {n.tipo === 'reserva' ? '🛍️' : n.tipo === 'entrega' ? '✅' : '🔔'}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{n.titulo}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.mensaje}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
