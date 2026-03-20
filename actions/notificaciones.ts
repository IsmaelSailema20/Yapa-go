'use server'

import { createClient } from '@/lib/supabase/server'

export async function marcarNotificacionLeida(notifId: string) {
  const supabase = await createClient()
  await supabase
    .from('notificaciones')
    .update({ leida: true })
    .eq('id', notifId)
  return { success: true }
}

export async function marcarTodasLeidas() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  await supabase
    .from('notificaciones')
    .update({ leida: true })
    .eq('usuario_id', user.id)
    .eq('leida', false)

  return { success: true }
}
