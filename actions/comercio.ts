'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const actualizarPerfilSchema = z.object({
  nombre_completo: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  ruc: z.string().length(13, 'El RUC debe tener exactamente 13 dígitos'),
  nombre_comercial: z.string().min(3, 'El nombre comercial es muy corto'),
  direccion_texto: z.string().min(5, 'Especifica una dirección más detallada'),
})

export async function actualizarPerfilComercio(prevState: any, formData: FormData) {
  const rawFields = {
    nombre_completo: formData.get('nombre_completo'),
    ruc: formData.get('ruc'),
    nombre_comercial: formData.get('nombre_comercial'),
    direccion_texto: formData.get('direccion_texto'),
  }

  const parse = actualizarPerfilSchema.safeParse(rawFields)

  if (!parse.success) {
    return { error: parse.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  // Update perfiles table
  const { error: errorPerfil } = await supabase
    .from('perfiles')
    .update({ nombre_completo: parse.data.nombre_completo })
    .eq('id', user.id)

  if (errorPerfil) return { error: `Error perfil: ${errorPerfil.message}` }

  // Update comercios table
  const { error: errorComercio } = await supabase
    .from('comercios')
    .update({
      ruc: parse.data.ruc,
      nombre_comercial: parse.data.nombre_comercial,
      direccion_texto: parse.data.direccion_texto,
    })
    .eq('id', user.id)

  if (errorComercio) return { error: `Error comercio: ${errorComercio.message}` }

  revalidatePath('/comercio/perfil')
  return { success: 'Perfil actualizado exitosamente' }
}
