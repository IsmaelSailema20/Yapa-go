'use client'

import { useActionState } from 'react'
import { guardarOnboarding } from '@/actions/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Store, MapPin, CheckCircle2 } from 'lucide-react'

const initialState = {
  error: null,
}

export default function OnboardingPage() {
  const [state, formAction, isPending] = useActionState(guardarOnboarding as any, initialState)

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center py-10">
      <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
            <Store className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Completa tu Perfil de Comercio</h1>
          <p className="text-lg text-muted-foreground mx-auto max-w-lg">
            Estás a un paso de unirte a la red y comenzar a rescatar tus excedentes alimentarios.
          </p>
        </div>

        <div className="rounded-3xl border bg-card text-card-foreground shadow-xl shadow-primary/5 overflow-hidden">
          <div className="h-2 bg-linear-to-r from-primary via-secondary to-primary bg-size-[200%_auto] animate-gradient"></div>
          
          <form action={formAction} className="p-8 sm:p-10 space-y-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3 sm:col-span-2">
                <Label htmlFor="ruc" className="text-sm font-semibold">RUC (13 dígitos)</Label>
                <Input id="ruc" name="ruc" type="text" placeholder="1700000000001" required maxLength={13} minLength={13} className="h-12 bg-muted/50 focus:bg-background transition-colors" />
              </div>
              <div className="space-y-3 sm:col-span-2">
                <Label htmlFor="nombre_comercial" className="text-sm font-semibold">Nombre Comercial</Label>
                <Input id="nombre_comercial" name="nombre_comercial" type="text" placeholder="Ej. Mi Panadería Sustentable" required className="h-12 bg-muted/50 focus:bg-background transition-colors" />
              </div>
              <div className="space-y-3 sm:col-span-2">
                <Label htmlFor="direccion_texto" className="text-sm font-semibold">Dirección Física</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input id="direccion_texto" name="direccion_texto" type="text" placeholder="Av. Principal y Secundaria" required className="h-12 pl-10 bg-muted/50 focus:bg-background transition-colors" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-primary font-semibold">
                <CheckCircle2 className="h-5 w-5" />
                <span>Ubicación GPS Detectada</span>
              </div>
              <p className="text-sm text-muted-foreground">La integración Leaflet se hará en la Fase 3. Por ahora, utilizaremos coordenadas por defecto para tu visibilidad en el mapa.</p>
              <div className="flex gap-4 max-w-md mx-auto">
                <div className="flex-1 space-y-2 text-left">
                  <Label htmlFor="lat" className="text-xs text-muted-foreground uppercase">Latitud</Label>
                  <Input id="lat" name="lat" type="text" defaultValue="-0.180653" readOnly className="bg-white/50 dark:bg-black/50 border-none" />
                </div>
                <div className="flex-1 space-y-2 text-left">
                  <Label htmlFor="lng" className="text-xs text-muted-foreground uppercase">Longitud</Label>
                  <Input id="lng" name="lng" type="text" defaultValue="-78.467838" readOnly className="bg-white/50 dark:bg-black/50 border-none" />
                </div>
              </div>
            </div>

            {state?.error && (
              <div className="rounded-lg bg-destructive/15 p-4 text-center">
                <p className="text-sm font-medium text-destructive">{state.error}</p>
              </div>
            )}

            <Button type="submit" className="w-full h-14 text-lg font-medium shadow-xl shadow-primary/20 transition-all hover:-translate-y-1" disabled={isPending}>
              {isPending ? 'Guardando tu perfil...' : 'Guardar y Entrar al Dashboard'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
