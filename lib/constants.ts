export const ROLES = {
  COMERCIO: 'comercio',
  CLIENTE: 'cliente',
} as const

export const PACK_ESTADOS = {
  DISPONIBLE: 'disponible',
  AGOTADO: 'agotado',
  EXPIRADO: 'expirado',
} as const

export const RESERVA_ESTADOS = {
  PENDIENTE: 'pendiente',
  ENTREGADO: 'entregado',
  CANCELADO: 'cancelado',
} as const

export const STORAGE_BUCKETS = {
  PACK_IMAGES: 'YAPASEGURA',
} as const

export function formatCurrency(value: number | null): string {
  if (value === null) return '$0.00'
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}
