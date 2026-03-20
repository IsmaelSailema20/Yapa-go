'use client'

import { useState } from 'react'
import { actualizarPerfilCliente } from '@/actions/perfil'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, User, Phone, Mail, CalendarDays, CheckCircle2 } from 'lucide-react'

export function PerfilClienteForm({ perfil }: { perfil: any }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fechaRegistro = new Date(perfil.fecha_registro).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(false)
    const res = await actualizarPerfilCliente(formData)
    if (res?.error) {
      setError(res.error)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header Info Card */}
      <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="h-10 w-10" />
        </div>
        <div className="flex-1 text-center sm:text-left space-y-2">
          <h2 className="text-2xl font-bold">{perfil.nombre_completo || 'Cliente Sin Nombre'}</h2>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-muted-foreground justify-center sm:justify-start">
            <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {perfil.email}</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> Miembro desde {fechaRegistro}</span>
          </div>
        </div>
      </div>

      {/* Editor Form */}
      <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-semibold mb-6">Información Personal</h3>
        
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre_completo">Nombre Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nombre_completo"
                  name="nombre_completo"
                  defaultValue={perfil.nombre_completo || ''}
                  className="pl-9 h-11 rounded-xl bg-muted/50"
                  placeholder="Ej: María Pérez"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  defaultValue={perfil.telefono || ''}
                  className="pl-9 h-11 rounded-xl bg-muted/50"
                  placeholder="Ej: 0991234567"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-sm font-medium text-destructive mt-2">{error}</p>}
          
          {success && (
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 p-3 rounded-lg">
              <CheckCircle2 className="h-4 w-4" /> Perfil actualizado correctamente
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl text-base font-medium">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
