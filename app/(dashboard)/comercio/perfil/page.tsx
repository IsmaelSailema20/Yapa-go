import { createClient } from '@/lib/supabase/server'
import { PerfilForm } from '@/components/comercio/perfil-form'

export default async function PerfilComercioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre_completo, email')
    .eq('id', user!.id)
    .single()

  const { data: comercio } = await supabase
    .from('comercios')
    .select('ruc, nombre_comercial, direccion_texto')
    .eq('id', user!.id)
    .single()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mi Perfil</h1>
        <p className="text-muted-foreground mt-1">Administra la información de tu cuenta y tu negocio.</p>
      </div>

      <div className="rounded-3xl border bg-card shadow-sm overflow-hidden">
        <PerfilForm perfil={perfil} comercio={comercio} />
      </div>
    </div>
  )
}
