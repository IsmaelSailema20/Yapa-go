import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/constants'
import { Plus, Package } from 'lucide-react'
import Link from 'next/link'
import { PackActions } from '@/components/comercio/pack-actions'
import { PackImageViewer } from '@/components/comercio/pack-image-viewer'

export default async function PacksListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: packs } = await supabase
    .from('packs')
    .select('*')
    .eq('comercio_id', user!.id)
    .order('estado', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mis Packs</h1>
          <p className="text-muted-foreground mt-1">Gestiona los packs de tu comercio.</p>
        </div>
        <Link
          href="/comercio/packs/nuevo"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          Nuevo Pack
        </Link>
      </div>

      {(!packs || packs.length === 0) ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-16 text-center shadow-sm">
          <Package className="h-16 w-16 text-muted-foreground/30 mb-6" />
          <p className="text-lg font-semibold text-muted-foreground">Sin packs todavía</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">Publica tu primer pack de excedentes y comienza a generar ahorro.</p>
          <Link
            href="/comercio/packs/nuevo"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            Crear Pack
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packs.map((pack) => (
            <div key={pack.id} className="relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md">
              <PackImageViewer url={pack.foto_url} alt={pack.titulo} estado={pack.estado} />
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-semibold text-base truncate">{pack.titulo}</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-primary">{formatCurrency(pack.precio_rescate)}</span>
                  <span className="text-sm text-muted-foreground line-through">{formatCurrency(pack.precio_original)}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{pack.cantidad_disponible} disponibles</p>
                <div className="mt-4 pt-3 border-t">
                  <PackActions packId={pack.id} estado={pack.estado} cantidad={pack.cantidad_disponible} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
