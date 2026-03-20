'use client'

import { useActionState, useState, useRef } from 'react'
import { crearPack } from '@/actions/packs'
import { simulateAIValidation } from '@/lib/ai-validation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Upload, ImageIcon, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

const initialState = { error: null }

export default function NuevoPackPage() {
  const [state, formAction, isPending] = useActionState(crearPack as any, initialState)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<ReturnType<typeof simulateAIValidation> | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      // Run simulated AI validation
      setAiResult(simulateAIValidation('preview', url))
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/comercio/packs"
          className="flex h-10 w-10 items-center justify-center rounded-xl border bg-card text-muted-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo Pack</h1>
          <p className="text-sm text-muted-foreground">Publica un nuevo pack de excedentes alimentarios.</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <form action={formAction} className="p-6 sm:p-8 space-y-6">
          {/* Image Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Foto del Pack</Label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors ${
                previewUrl
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50'
              } aspect-[16/9] sm:aspect-[3/1] overflow-hidden`}
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Cambiar imagen</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Haz clic para subir una imagen</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG o WEBP · máx 5MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              name="imagen"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* AI Validation Badge */}
          {aiResult && (
            <div className={`flex items-center gap-3 rounded-xl border p-4 ${
              aiResult.aprobado
                ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950'
                : 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'
            }`}>
              {aiResult.aprobado ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold">{aiResult.mensaje}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  <Sparkles className="inline h-3 w-3 mr-1" />
                  Puntuación IA: {aiResult.score}/100
                </p>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="titulo" className="text-sm font-semibold">Título del Pack</Label>
              <Input
                id="titulo"
                name="titulo"
                placeholder="Ej: Pack Pan del Día — 5 unidades"
                required
                maxLength={100}
                className="h-12 bg-muted/50 focus:bg-background transition-colors"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="precio_original" className="text-sm font-semibold">Precio Original ($)</Label>
                <Input
                  id="precio_original"
                  name="precio_original"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="5.00"
                  required
                  className="h-12 bg-muted/50 focus:bg-background transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precio_rescate" className="text-sm font-semibold">Precio de Rescate ($)</Label>
                <Input
                  id="precio_rescate"
                  name="precio_rescate"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="2.50"
                  required
                  className="h-12 bg-muted/50 focus:bg-background transition-colors"
                />
                <p className="text-xs text-muted-foreground">Debe ser menor al precio original.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="costo_produccion" className="text-sm font-semibold">Costo de Producción ($)</Label>
                <Input
                  id="costo_produccion"
                  name="costo_produccion"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="2.00"
                  required
                  className="h-12 bg-muted/50 focus:bg-background transition-colors"
                />
                <p className="text-xs text-muted-foreground">Suele ser el 30–40% del precio original.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cantidad_disponible" className="text-sm font-semibold">Cantidad Disponible</Label>
                <Input
                  id="cantidad_disponible"
                  name="cantidad_disponible"
                  type="number"
                  min="1"
                  defaultValue="1"
                  required
                  className="h-12 bg-muted/50 focus:bg-background transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {state?.error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4">
              <p className="text-sm font-medium text-destructive">{state.error}</p>
            </div>
          )}

          {/* Submit */}
          <input type="hidden" name="ai_aprobado" value={aiResult?.aprobado ? '1' : '0'} />
          <Button
            type="submit"
            className="w-full h-13 text-base font-medium shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 rounded-xl"
            disabled={isPending || !aiResult?.aprobado}
          >
            {isPending ? 'Publicando pack...' : 'Publicar Pack'}
          </Button>
        </form>
      </div>
    </div>
  )
}
