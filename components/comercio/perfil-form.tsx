'use client'

import { useActionState } from 'react'
import { actualizarPerfilComercio } from '@/actions/comercio'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Store, MapPin, User as UserIcon, CheckCircle2 } from 'lucide-react'

const initialState = {
  error: null as string | null,
  success: null as string | null,
}

export function PerfilForm({ perfil, comercio }: { perfil: any, comercio: any }) {
  const [state, formAction, isPending] = useActionState(actualizarPerfilComercio as any, initialState)

  return (
    <form action={formAction} className="p-6 sm:p-8 space-y-8">
      {/* Datos del Propietario */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
          <UserIcon className="h-5 w-5 text-primary" />
          Datos del Propietario
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nombre_completo">Nombre Completo</Label>
            <Input 
              id="nombre_completo" 
              name="nombre_completo" 
              defaultValue={perfil?.nombre_completo || ''} 
              required 
              className="bg-muted/50 focus:bg-background h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico (No editable)</Label>
            <Input 
              id="email" 
              defaultValue={perfil?.email || ''} 
              disabled 
              className="bg-muted/30 text-muted-foreground h-12"
            />
          </div>
        </div>
      </div>

      {/* Información del Comercio */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
          <Store className="h-5 w-5 text-primary" />
          Información del Comercio
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="nombre_comercial">Nombre Comercial</Label>
            <Input 
              id="nombre_comercial" 
              name="nombre_comercial" 
              defaultValue={comercio?.nombre_comercial || ''} 
              required 
              className="bg-muted/50 focus:bg-background h-12"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ruc">RUC (13 dígitos)</Label>
            <Input 
              id="ruc" 
              name="ruc" 
              defaultValue={comercio?.ruc || ''} 
              required 
              maxLength={13}
              minLength={13}
              className="bg-muted/50 focus:bg-background h-12"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="direccion_texto">Dirección Física</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input 
                id="direccion_texto" 
                name="direccion_texto" 
                defaultValue={comercio?.direccion_texto || ''} 
                required 
                className="pl-10 bg-muted/50 focus:bg-background h-12"
              />
            </div>
          </div>
        </div>
      </div>

      {state?.error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4">
          <p className="text-sm font-medium text-destructive">{state.error}</p>
        </div>
      )}

      {state?.success && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{state.success}</p>
        </div>
      )}

      {/* Submit */}
      <Button 
        type="submit" 
        disabled={isPending}
        className="w-full h-13 text-base shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 sm:w-auto mt-4 px-8 rounded-xl"
      >
        {isPending ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </form>
  )
}
