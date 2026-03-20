'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, Loader2 } from 'lucide-react'
import { marcarLeidasPorIds } from '@/actions/notificaciones'

interface Notificacion {
  id: string
  titulo: string
  mensaje: string
  tipo: string
  leida: boolean
  created_at: string
}

function getRelativeTime(dateString: string) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return `hace ${diffInSeconds}s`
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `hace ${diffInMinutes}m`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `hace ${diffInHours}h`
  const diffInDays = Math.floor(diffInHours / 24)
  return `hace ${diffInDays}d`
}

export function NotificationBell({ userId }: { userId: string }) {
  const [notifs, setNotifs] = useState<Notificacion[]>([])
  const [open, setOpen] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()
  const PAGE_SIZE = 10

  // 1. Fetch unread count & initial Page 0
  useEffect(() => {
    async function loadInitial() {
      // Global unread count
      const { count } = await supabase
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', userId)
        .eq('leida', false)
      
      setUnreadCount(count ?? 0)

      // Primera página de notificaciones (no leídas primero, luego fecha)
      const { data } = await supabase
        .from('notificaciones')
        .select('id, titulo, mensaje, tipo, leida, created_at')
        .eq('usuario_id', userId)
        .order('leida', { ascending: true })
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE - 1)

      if (data) {
        setNotifs(data)
        setHasMore(data.length === PAGE_SIZE)
      }
      setLoadingInitial(false)
    }
    loadInitial()
  }, [userId, supabase])

  // 2. Realtime subscription para NUEVAS notificaciones
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
          const newNotif = payload.new as Notificacion
          setNotifs((prev) => [newNotif, ...prev])
          setUnreadCount((prev) => prev + 1)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])

  // 3. Mark only visible as read when opening panel
  async function handleOpen() {
    setOpen(!open)
    if (!open) {
      const visibleUnreadIds = notifs.filter((n) => !n.leida).map((n) => n.id)
      if (visibleUnreadIds.length > 0) {
        // Marcamos las visibles como leídas en BD
        await marcarLeidasPorIds(visibleUnreadIds)
        // Actualizamos estado visual
        setNotifs((prev) => prev.map((n) => ({ ...n, leida: true })))
        setUnreadCount((prev) => Math.max(0, prev - visibleUnreadIds.length))
      }
    }
  }

  // 4. Load More paginated callback
  async function cargarMas() {
    setLoadingMore(true)
    const nextPage = page + 1
    const from = nextPage * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data } = await supabase
      .from('notificaciones')
      .select('id, titulo, mensaje, tipo, leida, created_at')
      .eq('usuario_id', userId)
      .order('leida', { ascending: true })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (data && data.length > 0) {
      setNotifs((prev) => {
        // Evitar duplicados si hay drift de offset (por haber leído localmente)
        const existingIds = new Set(prev.map(n => n.id))
        const newUnique = data.filter(d => !existingIds.has(d.id))
        return [...prev, ...newUnique]
      })
      setPage(nextPage)
      if (data.length < PAGE_SIZE) setHasMore(false)
    } else {
      setHasMore(false)
    }
    setLoadingMore(false)
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border bg-muted/50 transition-colors hover:bg-muted"
        aria-label="Notificaciones"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop invisible para cerrar al hacer clic afuera */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          
          {/* Panel */}
          <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border bg-background shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b bg-card">
              <p className="font-semibold text-sm">Notificaciones</p>
              {unreadCount > 0 && (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-500 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  {unreadCount} nuevas
                </span>
              )}
            </div>
            
            <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
              {loadingInitial ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : notifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">Sin notificaciones</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Aquí verás tus alertas recientes.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifs.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-4 space-y-0.5 transition-colors ${n.leida ? 'opacity-70 bg-background' : 'bg-muted/30'}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 text-base shrink-0">
                          {n.tipo === 'reserva' ? '🛍️' : n.tipo === 'entrega' ? '✅' : '🔔'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm tracking-tight ${n.leida ? 'font-medium' : 'font-bold'} line-clamp-1`}>
                              {n.titulo}
                            </p>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap pt-0.5 font-mono">
                              {getRelativeTime(n.created_at)}
                            </span>
                          </div>
                          <p className={`text-xs mt-1 line-clamp-2 ${n.leida ? 'text-muted-foreground' : 'text-foreground/90'}`}>
                            {n.mensaje}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Botón Cargar Más */}
                  {hasMore && (
                    <div className="p-3 bg-muted/10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          cargarMas()
                        }}
                        disabled={loadingMore}
                        className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                      >
                        {loadingMore ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Cargando...
                          </>
                        ) : (
                          'Cargar notificaciones pasadas'
                        )}
                      </button>
                    </div>
                  )}
                  {!hasMore && notifs.length > 0 && (
                    <div className="p-3 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                        Fin del historial
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
