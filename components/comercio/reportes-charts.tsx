'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts'
import { Leaf, Droplets, Apple, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/constants'

interface Pack {
  id: string
  titulo: string
  precio_original: number
  precio_rescate: number
  estado: string
  created_at: string
}

interface Reserva {
  id: string
  pack_id: string
  estado: string
  fecha_reserva: string
}

interface ReportesChartsProps {
  packs: Pack[]
  reservas: Reserva[]
}

const COLORS = {
  disponible: '#10b981', // emerald-500
  agotado: '#f97316',    // orange-500
  cancelado: '#ef4444',  // red-500
  entregado: '#10b981',  
  pendiente: '#eab308'   // yellow-500
}

export function ReportesCharts({ packs, reservas }: ReportesChartsProps) {
  // 1. Procesar impacto ambiental (Solo Reservas Entregadas)
  const statsImpacto = useMemo(() => {
    const reservasEntregadas = reservas.filter(r => r.estado === 'entregado')
    const packsEntregados = reservasEntregadas.map(r => packs.find(p => p.id === r.pack_id)).filter(Boolean)

    const cantidad = packsEntregados.length
    // Aproximaciones globales (pueden ajustarse luego)
    const co2Ahorrado = cantidad * 1.5 // 1.5kg por pack
    const aguaAhorrada = cantidad * 250 // 250L por pack
    const comidaSalvada = packsEntregados.reduce((acc, p) => acc + ((p?.precio_original || 0) * 0.4), 0) // Estimado en dinero

    return {
      packsSalvados: cantidad,
      co2: co2Ahorrado.toFixed(1),
      agua: aguaAhorrada,
      comida: comidaSalvada.toFixed(1)
    }
  }, [packs, reservas])

  // 2. Procesar ingresos diarios (Últimos 14 días)
  const ingresosDiarios = useMemo(() => {
    const days = 14
    const result = Array.from({ length: days }).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (days - 1 - i))
      return {
        dateRef: d.toISOString().split('T')[0],
        fecha: `${d.getDate()}/${d.getMonth() + 1}`,
        ingresos: 0
      }
    })

    reservas.forEach(r => {
      if (r.estado !== 'entregado') return
      const p = packs.find(p => p.id === r.pack_id)
      if (!p) return
      
      const rDate = r.fecha_reserva?.split('T')[0]
      if (!rDate) return

      const dayEntry = result.find(d => d.dateRef === rDate)
      if (dayEntry) {
        dayEntry.ingresos += p.precio_rescate
      }
    })

    return result
  }, [packs, reservas])

  // 3. Estado de los Packs
  const packsPorEstado = useMemo(() => {
    const counts = packs.reduce((acc, p) => {
      acc[p.estado] = (acc[p.estado] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return [
      { name: 'Disponibles', value: counts['disponible'] || 0, color: COLORS.disponible },
      { name: 'Agotados', value: counts['agotado'] || 0, color: COLORS.agotado },
      { name: 'Vencidos/Cancelados', value: counts['cancelado'] || 0, color: COLORS.cancelado }
    ].filter(i => i.value > 0)
  }, [packs])

  // 4. Reservas Entregadas vs Canceladas (Últimos 7 días)
  const performanceReservas = useMemo(() => {
    const days = 7
    const result = Array.from({ length: days }).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (days - 1 - i))
      return {
        dateRef: d.toISOString().split('T')[0],
        fecha: `${d.getDate()}/${d.getMonth() + 1}`,
        Entregadas: 0,
        Canceladas: 0
      }
    })

    reservas.forEach(r => {
      if (r.estado === 'pendiente') return
      
      const rDate = r.fecha_reserva?.split('T')[0]
      if (!rDate) return

      const dayEntry = result.find(d => d.dateRef === rDate)
      if (dayEntry) {
        if (r.estado === 'entregado') dayEntry.Entregadas += 1
        if (r.estado === 'cancelado') dayEntry.Canceladas += 1
      }
    })

    return result
  }, [reservas])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-muted-foreground">{p.name}:</span>
              <span className="font-medium">
                {p.name === 'ingresos' ? formatCurrency(p.value) : p.value}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Tarjetas de Impacto Ambiental */}
      <h2 className="text-lg font-semibold tracking-tight">Tu Impacto Ambiental Positivo</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Packs Salvados</p>
            <p className="text-2xl font-bold">{statsImpacto.packsSalvados}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950">
            <Leaf className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">CO₂ Ahorrado</p>
            <p className="text-2xl font-bold">{statsImpacto.co2} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950">
            <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Agua Preservada</p>
            <p className="text-2xl font-bold">{statsImpacto.agua} <span className="text-sm font-normal text-muted-foreground">L</span></p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950">
            <Apple className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Comida Rescatada</p>
            <p className="text-2xl font-bold">{statsImpacto.comida} <span className="text-sm font-normal text-muted-foreground">kg eq.</span></p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico 1: Ingresos de Rescate */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold mb-6">Ingresos por Rescate (Últimos 14 días)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ingresosDiarios} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.disponible} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.disponible} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} tickFormatter={(val) => `$${val}`} />
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e0e0e0" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="ingresos" stroke={COLORS.disponible} strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Desempeño de Reservas */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold mb-6">Reservas: Entregadas vs Canceladas (7 días)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceReservas} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e0e0e0" />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }}/>
                <Bar dataKey="Entregadas" fill={COLORS.entregado} radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Canceladas" fill={COLORS.cancelado} radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 3: Proporción del Estado de Packs */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold mb-2">Composición de tu inventario</h3>
          <p className="text-sm text-muted-foreground mb-6">Distribución histórica de los packs publicados.</p>
          <div className="h-[250px] w-full">
            {packsPorEstado.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={packsPorEstado}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {packsPorEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No hay datos suficientes
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
