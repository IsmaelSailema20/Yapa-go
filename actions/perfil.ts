'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function actualizarPerfilCliente(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const nombre_completo = formData.get('nombre_completo') as string
  const telefono = formData.get('telefono') as string

  const { error } = await supabase
    .from('perfiles')
    .update({ 
      nombre_completo: nombre_completo?.trim() || null, 
      telefono: telefono?.trim() || null 
    })
    .eq('id', user.id)

  if (error) return { error: 'Error al actualizar tu perfil: ' + error.message }

  revalidatePath('/cliente/perfil')
  return { success: true }
}

export async function actualizarPerfilComercio(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const nombre_completo = formData.get('nombre_completo') as string
  const telefono = formData.get('telefono') as string
  const nombre_comercial = formData.get('nombre_comercial') as string
  const ruc = formData.get('ruc') as string
  const direccion_texto = formData.get('direccion_texto') as string
  const lat = formData.get('lat')
  const lng = formData.get('lng')

  // Update perfiles table
  const { error: errorPerfil } = await supabase
    .from('perfiles')
    .update({ 
      nombre_completo: nombre_completo?.trim() || null, 
      telefono: telefono?.trim() || null 
    })
    .eq('id', user.id)

  if (errorPerfil) return { error: 'Error al actualizar perfil: ' + errorPerfil.message }

  // Update comercios table
  if (nombre_comercial && ruc && lat && lng) {
    const latNum = parseFloat(lat as string)
    const lngNum = parseFloat(lng as string)
    
    // Using RPC to safely update geometry
    const { error: errorUbicacion } = await supabase.rpc('actualizar_ubicacion_comercio', {
      p_id: user.id,
      p_nombre_comercial: nombre_comercial.trim(),
      p_ruc: ruc.trim(),
      p_direccion_texto: direccion_texto?.trim() || null,
      p_lng: lngNum,
      p_lat: latNum
    })

    if (errorUbicacion) {
      // Fallback update without RPC if RPC doesn't exist yet
      const { error: errorCom} = await supabase
        .from('comercios')
        .update({
          nombre_comercial: nombre_comercial.trim(),
          ruc: ruc.trim(),
          direccion_texto: direccion_texto?.trim() || null,
          ubicacion: `POINT(${lngNum} ${latNum})`
        })
        .eq('id', user.id)
        
      if (errorCom) return { error: 'Error al actualizar datos del comercio: ' + errorCom.message }
    }
  }

  revalidatePath('/comercio/perfil')
  return { success: true }
}
