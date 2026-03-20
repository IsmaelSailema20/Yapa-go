'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function reservarPack(packId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  // 1. Verificar que el pack existe y tiene stock
  const { data: pack, error: packError } = await supabase
    .from('packs')
    .select('id, titulo, cantidad_disponible, estado, comercio_id')
    .eq('id', packId)
    .single()

  if (packError || !pack) {
    return { error: 'Pack no encontrado' }
  }

  if (pack.estado !== 'disponible' || pack.cantidad_disponible <= 0) {
    return { error: 'Este pack ya no está disponible' }
  }

  // 2. Verificar que el cliente no tenga ya una reserva pendiente para este pack
  const { data: reservaExistente } = await supabase
    .from('reservas')
    .select('id')
    .eq('pack_id', packId)
    .eq('cliente_id', user.id)
    .eq('estado', 'pendiente')
    .maybeSingle()

  if (reservaExistente) {
    return { error: 'Ya tienes una reserva pendiente para este pack' }
  }

  // 3. Insertar la reserva (el trigger de la BDD genera el OTP automáticamente)
  const { data: reserva, error: reservaError } = await supabase
    .from('reservas')
    .insert({
      pack_id: packId,
      cliente_id: user.id,
      estado: 'pendiente',
    })
    .select('id, codigo_otp')
    .single()

  if (reservaError) {
    return { error: 'Error al crear la reserva: ' + reservaError.message }
  }

  // 4. (Eliminado a petición: el stock ya no se descuenta al reservar sino al validar el OTP)

  // 5. Notificar al comercio
  await supabase.from('notificaciones').insert({
    usuario_id: pack.comercio_id,
    titulo: 'Nueva reserva',
    mensaje: `Tienes una nueva reserva en tu pack "${pack.titulo}"`,
    tipo: 'reserva',
  })

  return {
    success: true,
    codigoOTP: reserva.codigo_otp,
    mensaje: `¡Reserva exitosa! Tu código de retiro es: ${reserva.codigo_otp}`,
  }
}

export async function cancelarReserva(reservaId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  const { data: reserva } = await supabase
    .from('reservas')
    .select('id, pack_id, estado')
    .eq('id', reservaId)
    .eq('cliente_id', user.id)
    .single()

  if (!reserva || reserva.estado !== 'pendiente') {
    return { error: 'Reserva no válida o ya procesada' }
  }

  // Cancelar reserva
  await supabase
    .from('reservas')
    .update({ estado: 'cancelado' })
    .eq('id', reservaId)

  // (Eliminado a petición: como no se descontó el stock al reservar, no hay que devolverlo al cancelar)

  return { success: true }
}
