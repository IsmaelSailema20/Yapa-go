'use client'

import { Button } from '@/components/ui/button'
import { actualizarEstadoPack, actualizarCantidadPack } from '@/actions/packs'
import { Minus, Plus, Ban } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function PackActions({ packId, estado, cantidad }: { packId: string; estado: string; cantidad: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleMarcarAgotado() {
    setLoading(true)
    await actualizarEstadoPack(packId, 'agotado')
    router.refresh()
    setLoading(false)
  }

  async function handleCantidad(delta: number) {
    setLoading(true)
    await actualizarCantidadPack(packId, Math.max(0, cantidad + delta))
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={() => handleCantidad(-1)}
          disabled={loading || cantidad <= 0}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="min-w-[2rem] text-center text-sm font-semibold">{cantidad}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={() => handleCantidad(1)}
          disabled={loading}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      {estado === 'disponible' && (
        <Button
          variant="destructive"
          size="sm"
          className="rounded-lg text-xs gap-1.5"
          onClick={handleMarcarAgotado}
          disabled={loading}
        >
          <Ban className="h-3 w-3" />
          Agotar
        </Button>
      )}
    </div>
  )
}
