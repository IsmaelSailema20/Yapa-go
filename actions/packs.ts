'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { STORAGE_BUCKETS } from '@/lib/constants'

const crearPackSchema = z.object({
  titulo: z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  precio_original: z.coerce.number().positive('Debe ser mayor a 0'),
  precio_rescate: z.coerce.number().positive('Debe ser mayor a 0'),
  costo_produccion: z.coerce.number().min(0, 'No puede ser negativo'),
  cantidad_disponible: z.coerce.number().int().min(1, 'Mínimo 1 unidad'),
})

export async function crearPack(prevState: any, formData: FormData) {
  const rawFields = {
    titulo: formData.get('titulo'),
    precio_original: formData.get('precio_original'),
    precio_rescate: formData.get('precio_rescate'),
    costo_produccion: formData.get('costo_produccion'),
    cantidad_disponible: formData.get('cantidad_disponible'),
  }

  const parse = crearPackSchema.safeParse(rawFields)

  if (!parse.success) {
    return { error: parse.error.issues[0].message }
  }

  if (parse.data.precio_rescate >= parse.data.precio_original) {
    return { error: 'El precio de rescate debe ser menor al precio original' }
  }

  const aiAprobado = formData.get('ai_aprobado')
  if (aiAprobado !== '1') {
    return { error: 'El pack debe ser aprobado por la validación de IA local de la imagen antes de publicarse.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  // Handle image upload
  const imagen = formData.get('imagen') as File | null
  let foto_url: string | null = null

  if (imagen && imagen.size > 0) {
    const ext = imagen.name.split('.').pop() || 'jpg'
    const fileName = `${user.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.PACK_IMAGES)
      .upload(fileName, imagen, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      return { error: `Error al subir imagen: ${uploadError.message}` }
    }

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKETS.PACK_IMAGES)
      .getPublicUrl(fileName)

    foto_url = urlData.publicUrl
  }

  const { error } = await supabase.from('packs').insert({
    comercio_id: user.id,
    titulo: parse.data.titulo,
    precio_original: parse.data.precio_original,
    precio_rescate: parse.data.precio_rescate,
    costo_produccion: parse.data.costo_produccion,
    cantidad_disponible: parse.data.cantidad_disponible,
    foto_url,
    estado: 'disponible',
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/comercio/packs')
}

export async function actualizarEstadoPack(packId: string, nuevoEstado: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('packs')
    .update({ estado: nuevoEstado })
    .eq('id', packId)
    .eq('comercio_id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function actualizarCantidadPack(packId: string, nuevaCantidad: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const updates: Record<string, any> = { cantidad_disponible: nuevaCantidad }
  if (nuevaCantidad === 0) updates.estado = 'agotado'
  if (nuevaCantidad > 0) updates.estado = 'disponible'

  const { error } = await supabase
    .from('packs')
    .update(updates)
    .eq('id', packId)
    .eq('comercio_id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
