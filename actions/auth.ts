'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const registroSchema = z.object({
  nombre_completo: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  rol: z.enum(['comercio', 'cliente']),
})

export async function login(prevState: any, formData: FormData) {
  const parse = loginSchema.safeParse(Object.fromEntries(formData))

  if (!parse.success) {
    return { error: parse.error.issues[0].message }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parse.data.email,
    password: parse.data.password,
  })

  if (error) {
    return { error: 'Credenciales inválidas' }
  }

  // Verificar perfil
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', data.user.id)
    .single()

  if (perfil?.rol === 'comercio') {
    redirect('/comercio')
  } else {
    redirect('/cliente')
  }
}

export async function registro(prevState: any, formData: FormData) {
  const parse = registroSchema.safeParse(Object.fromEntries(formData))

  if (!parse.success) {
    return { error: parse.error.issues[0].message }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: parse.data.email,
    password: parse.data.password,
    options: {
      data: {
        nombre_completo: parse.data.nombre_completo,
        rol: parse.data.rol,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // Insert en perfiles (si no se hace por trigger)
    await supabase.from('perfiles').insert({
      id: data.user.id,
      email: parse.data.email,
      nombre_completo: parse.data.nombre_completo,
      rol: parse.data.rol,
    })

    if (parse.data.rol === 'comercio') {
      redirect('/onboarding')
    } else {
      redirect('/cliente')
    }
  }

  return { error: 'Error inesperado' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

const onboardingSchema = z.object({
  ruc: z.string().length(13, 'El RUC debe tener 13 dígitos'),
  nombre_comercial: z.string().min(2, 'Nombre comercial requerido'),
  direccion_texto: z.string().min(5, 'Dirección requerida'),
  lat: z.string().min(1, 'Ubicación requerida'),
  lng: z.string().min(1, 'Ubicación requerida'),
})

export async function guardarOnboarding(prevState: any, formData: FormData) {
  const parse = onboardingSchema.safeParse(Object.fromEntries(formData))

  if (!parse.success) {
    return { error: parse.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  // PostGIS exact query construction isn't directly supported by object insert for Geography in supabase-js natively 
  // without raw sql if passing text, but usually 'POINT(lng lat)' string works for geography(POINT).
  const point = `POINT(${parse.data.lng} ${parse.data.lat})`

  const { error } = await supabase.from('comercios').insert({
    id: user.id,
    ruc: parse.data.ruc,
    nombre_comercial: parse.data.nombre_comercial,
    direccion_texto: parse.data.direccion_texto,
    ubicacion: point,
    perfil_completado: true
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/comercio')
}
