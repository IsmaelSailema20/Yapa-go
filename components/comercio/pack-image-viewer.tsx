'use client'

import { useState } from 'react'
import { Package, Maximize2, X } from 'lucide-react'
import { createPortal } from 'react-dom'

interface PackImageViewerProps {
  url: string | null
  alt: string
  estado: string
}

function Lightbox({ url, alt, onClose }: { url: string; alt: string; onClose: () => void }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button — always relative to the screen */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-black/80"
        aria-label="Cerrar"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Image — stops propagation so clicking it doesn't close */}
      <img
        src={url}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
      />
    </div>,
    document.body
  )
}

export function PackImageViewer({ url, alt, estado }: PackImageViewerProps) {
  const [open, setOpen] = useState(false)

  const badgeColor =
    estado === 'disponible' ? 'bg-emerald-500 text-white' :
    estado === 'agotado' ? 'bg-orange-500 text-white' :
    'bg-red-500 text-white'

  const badgeText = estado.charAt(0).toUpperCase() + estado.slice(1)

  return (
    <>
      {/* Card image thumbnail */}
      <button
        onClick={() => url && setOpen(true)}
        className="relative block h-48 w-full shrink-0 overflow-hidden bg-muted group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`Ver imagen de ${alt} a pantalla completa`}
      >
        {url ? (
          <>
            <img
              src={url}
              alt={alt}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/25">
              <Maximize2 className="h-8 w-8 text-white opacity-0 drop-shadow-lg transition-opacity group-hover:opacity-100" />
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold shadow ${badgeColor}`}>
          {badgeText}
        </span>
      </button>

      {/* Lightbox portal */}
      {open && url && <Lightbox url={url} alt={alt} onClose={() => setOpen(false)} />}
    </>
  )
}
