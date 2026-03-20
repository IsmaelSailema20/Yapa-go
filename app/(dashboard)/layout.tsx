import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/navbar'
import { ReactNode } from 'react'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let rol: string | null = null
  if (user) {
    const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
    rol = perfil?.rol ?? null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar rol={rol} />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
