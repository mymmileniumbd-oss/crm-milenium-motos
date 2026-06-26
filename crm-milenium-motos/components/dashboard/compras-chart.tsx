// components/dashboard/compras-chart.tsx
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
import { formatSoles } from '@/lib/utils/format'
import { MODELOS_MOTO } from '@/lib/constants'

interface CompraRow {
  modelo?: string | null
  precio_compra_moto?: number | string | null
  precio_fibra?: number | string | null
}

export function ComprasChart({ compras }: { compras: CompraRow[] }) {
  const data = MODELOS_MOTO.map(modelo => {
    const items = compras.filter(c => c.modelo === modelo)
    return {
      modelo,
      motos: items.reduce((acc, c) => acc + Number(c.precio_compra_moto ?? 0), 0),
      fibra: items.reduce((acc, c) => acc + Number(c.precio_fibra ?? 0), 0),
    }
  }).filter(d => d.motos > 0 || d.fibra > 0)

  const totalMotos = compras.reduce((acc, c) => acc + Number(c.precio_compra_moto ?? 0), 0)
  const totalFibra = compras.reduce((acc, c) => acc + Number(c.precio_fibra ?? 0), 0)

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Compras del periodo</h2>
        <p className="text-sm text-muted-foreground">{formatSoles(totalMotos + totalFibra)} total</p>
      </div>
      <div className="flex gap-4 text-sm">
        <span className="text-muted-foreground">
          Motos: <strong>{formatSoles(totalMotos)}</strong>
        </span>
        <span className="text-muted-foreground">
          Fibra: <strong>{formatSoles(totalFibra)}</strong>
        </span>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Sin compras en el periodo</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="modelo" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => formatSoles(Number(value ?? 0))} />
            <Legend />
            <Bar dataKey="motos" name="Motos" stackId="a" fill="#3b82f6" />
            <Bar dataKey="fibra" name="Fibra" stackId="a" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
