import { createClient } from '@/lib/supabase/server'
import { PerfilClienteForm } from '@/components/cliente/perfil-form'
import { redirect } from 'next/navigation'

export default async function ClientePerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!perfil) return <p>Perfil no encontrado.</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mi Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tu información personal.
        </p>
      </div>

      <PerfilClienteForm perfil={perfil} />
    </div>
  )
}
