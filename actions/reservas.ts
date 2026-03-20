'use server'

import { createClient } from '@/lib/supabase/server'

// ────────────────────────────────────────────────
// Fase 4: Validación OTP por parte del comercio
// ────────────────────────────────────────────────

export async function validarOTP(codigo: string) {
  if (!codigo || codigo.length !== 6) {
    return { error: 'El código debe tener 6 dígitos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Buscar la reserva pendiente con este OTP
  const { data: reserva, error: findError } = await supabase
    .from('reservas')
    .select(`
      id,
      cliente_id,
      estado,
      pack_id,
      packs (
        id,
        titulo,
        cantidad_disponible,
        comercio_id
      )
    `)
    .eq('codigo_otp', codigo.trim())
    .eq('estado', 'pendiente')
    .maybeSingle()

  if (findError || !reserva) {
    return { error: 'Código inválido o reserva no encontrada' }
  }

  // Verificar que el pack pertenece a este comercio
  if ((reserva.packs as any).comercio_id !== user.id) {
    return { error: 'Este código no corresponde a un pack de tu comercio' }
  }

  const pack = reserva.packs as any

  // Marcar reserva como entregada
  const { error: updateError } = await supabase
    .from('reservas')
    .update({ estado: 'entregado' })
    .eq('id', reserva.id)

  if (updateError) return { error: 'Error al validar la reserva' }

  // Descontar stock ahora que fue validado
  const nuevaCantidad = Math.max(0, pack.cantidad_disponible - 1)
  await supabase
    .from('packs')
    .update({
      cantidad_disponible: nuevaCantidad,
      estado: nuevaCantidad === 0 ? 'agotado' : 'disponible',
    })
    .eq('id', pack.id)

  // Notificar al cliente que su pack fue entregado
  await supabase.from('notificaciones').insert({
    usuario_id: reserva.cliente_id,
    titulo: '¡Pack entregado!',
    mensaje: `Tu reserva de "${pack.titulo}" fue confirmada. ¡Buen provecho!`,
    tipo: 'entrega',
  })

  return {
    success: true,
    titulo: pack.titulo,
    mensaje: `¡Pack "${pack.titulo}" entregado correctamente!`,
  }
}

// ────────────────────────────────────────────────
// Fase 3: Reservas del cliente
// ────────────────────────────────────────────────

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

  // 3. Verificar límite de "Stock Suave" (no permitir reservar si las reservas pendientes agotan el stock visualmente)
  const { count: pendingCount, error: countError } = await supabase
    .from('reservas')
    .select('*', { count: 'exact', head: true })
    .eq('pack_id', packId)
    .eq('estado', 'pendiente')

  const totalPendientes = pendingCount || 0
  if (pack.cantidad_disponible - totalPendientes <= 0) {
    return { error: 'Este pack acaba de ser reservado por otro usuario' }
  }

  // 4. Insertar la reserva (el trigger de la BDD genera el OTP automáticamente)
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

  // 4. (Stock no se descuenta al reservar — se descuenta al validar el OTP)

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

  // Cancelar reserva (no restaurar stock porque no se descontó al reservar)
  await supabase
    .from('reservas')
    .update({ estado: 'cancelado' })
    .eq('id', reservaId)

  return { success: true }
}
