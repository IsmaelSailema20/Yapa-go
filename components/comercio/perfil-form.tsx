'use client'

import { useState } from 'react'
import { actualizarPerfilComercio } from '@/actions/perfil'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LocationPicker } from '@/components/shared/location-picker'
import { Loader2, Store, User, Phone, Mail, FileText, CheckCircle2, Building2 } from 'lucide-react'

interface PerfilComercioFormProps {
  perfil: any
  comercio: any
}

export function PerfilComercioForm({ perfil, comercio }: PerfilComercioFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [lat, setLat] = useState<number | null>(comercio?.lat ?? null)
  const [lng, setLng] = useState<number | null>(comercio?.lng ?? null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    if (!lat || !lng) {
      setError('Debes seleccionar una ubicación en el mapa')
      setLoading(false)
      return
    }

    formData.append('lat', lat.toString())
    formData.append('lng', lng.toString())

    const res = await actualizarPerfilComercio(formData)
    if (res?.error) {
      setError(res.error)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header Info Card */}
      <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Building2 className="h-10 w-10" />
        </div>
        <div className="flex-1 text-center sm:text-left space-y-2">
          <h2 className="text-2xl font-bold">{comercio?.nombre_comercial || 'Comercio'}</h2>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-muted-foreground justify-center sm:justify-start">
            <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {perfil.email}</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5"><FileText className="h-4 w-4" /> RUC: {comercio?.ruc}</span>
          </div>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-8">
        {/* Administrador / Dueño Section */}
        <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold border-b pb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Datos del Administrador
          </h3>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre_completo">Nombre Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nombre_completo"
                  name="nombre_completo"
                  defaultValue={perfil?.nombre_completo || ''}
                  className="pl-9 h-11 rounded-xl bg-muted/50"
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono de contacto</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  defaultValue={perfil?.telefono || ''}
                  className="pl-9 h-11 rounded-xl bg-muted/50"
                  placeholder="Ej: 0991234567"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Local Comercial Section */}
        <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold border-b pb-4 flex items-center gap-2">
            <Store className="h-5 w-5 text-emerald-600" /> Información del Local
          </h3>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre_comercial">Nombre Comercial</Label>
              <Input
                id="nombre_comercial"
                name="nombre_comercial"
                defaultValue={comercio?.nombre_comercial || ''}
                className="h-11 rounded-xl bg-muted/50"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ruc">RUC / NIT</Label>
              <Input
                id="ruc"
                name="ruc"
                defaultValue={comercio?.ruc || ''}
                className="h-11 rounded-xl bg-muted/50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion_texto">Dirección completa</Label>
            <Textarea
              id="direccion_texto"
              name="direccion_texto"
              defaultValue={comercio?.direccion_texto || ''}
              className="resize-none rounded-xl bg-muted/50 min-h-[80px]"
              placeholder="Ej: Av. Amazonas y República, Edificio Las Cámaras"
              required
            />
          </div>

          <div className="space-y-2 pt-2">
            <Label>Ubicación en el Mapa</Label>
            <p className="text-xs text-muted-foreground mb-4">
              Arrastra el marcador para precisar la ubicación de tu local o panadería.
            </p>
            <div className="h-[300px] w-full overflow-hidden rounded-xl border">
              <LocationPicker
                initialLat={lat ?? undefined}
                initialLng={lng ?? undefined}
                onLocationSelect={(l, ln) => {
                  setLat(l)
                  setLng(ln)
                }}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-medium text-destructive">
            {error}
          </div>
        )}
        
        {success && (
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 p-4 rounded-xl">
            <CheckCircle2 className="h-5 w-5" /> 
            <div>
              <p className="font-semibold">¡Actualización exitosa!</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">Los datos de tu comercio y perfil fueron guardados.</p>
            </div>
          </div>
        )}

        {/* Flotante Save Button Container */}
        <div className="sticky bottom-4 z-10 flex justify-end rounded-2xl bg-background/80 px-4 py-3 backdrop-blur-md shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] border sm:static sm:bg-transparent sm:backdrop-blur-none sm:shadow-none sm:border-0 sm:p-0">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto h-12 px-8 rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Guardando...
              </>
            ) : (
              'Guardar Cambios del Comercio'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
