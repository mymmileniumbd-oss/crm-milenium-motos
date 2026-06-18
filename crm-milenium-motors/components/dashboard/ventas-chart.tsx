// components/dashboard/ventas-chart.tsx
'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { MODELOS_MOTO } from '@/lib/constants'
import { formatSoles } from '@/lib/utils/format'

interface UnidadRef {
  modelo?: string | null
  precio_compra_moto?: number | string | null
  precio_fibra?: number | string | null
}

interface VentaRow {
  precio_venta: number | string | null
  unidades?: UnidadRef | UnidadRef[] | null
}

function getModelo(unidades?: UnidadRef | UnidadRef[] | null): string | null | undefined {
  if (!unidades) return null
  if (Array.isArray(unidades)) return unidades[0]?.modelo
  return unidades.modelo
}

export function VentasChart({ ventas }: { ventas: VentaRow[] }) {
  const data = MODELOS_MOTO.map(modelo => {
    const ventasModelo = ventas.filter(v => getModelo(v.unidades) === modelo)
    return {
      modelo,
      cantidad: ventasModelo.length,
      monto: ventasModelo.reduce((acc, v) => acc + Number(v.precio_venta), 0),
    }
  }).filter(d => d.cantidad > 0)

  const totalCantidad = ventas.length
  const totalMonto = ventas.reduce((acc, v) => acc + Number(v.precio_venta), 0)

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Ventas del periodo</h2>
        <div className="text-right text-sm">
          <p className="text-gray-500">
            {totalCantidad} unidades &middot; {formatSoles(totalMonto)}
          </p>
        </div>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">Sin ventas en el periodo</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="modelo" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value, name) =>
                name === 'Monto (S/)' ? formatSoles(Number(value ?? 0)) : value
              }
            />
            <Legend />
            <Bar yAxisId="left" dataKey="cantidad" name="Cantidad" fill="#3b82f6" />
            <Bar yAxisId="right" dataKey="monto" name="Monto (S/)" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
