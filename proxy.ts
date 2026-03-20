import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export default async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl
  const isAuthRoute = ['/login', '/registro', '/'].includes(pathname)

  // 1. Usuarios No Autenticados solo acceden a login/registro
  if (!user) {
    if (!isAuthRoute) return NextResponse.redirect(new URL('/login', request.url))
    return supabaseResponse
  }

  // 2. Usuarios Autenticados
  const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
  const rol = perfil?.rol

  if (rol === 'comercio') {
    const { data: comercio } = await supabase.from('comercios').select('perfil_completado').eq('id', user.id).maybeSingle()
    const isCompleted = comercio?.perfil_completado

    // Forzar onboarding
    if (!isCompleted && pathname !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
    // Evitar salir del scope de comercio
    if (isCompleted && (isAuthRoute || pathname === '/onboarding' || pathname.startsWith('/cliente'))) {
      return NextResponse.redirect(new URL('/comercio', request.url))
    }
  } else if (rol === 'cliente') {
    // Evitar que el cliente acceda a auth, onboarding o dashboard de comercio
    if (isAuthRoute || pathname === '/onboarding' || pathname.startsWith('/comercio')) {
      return NextResponse.redirect(new URL('/cliente', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
