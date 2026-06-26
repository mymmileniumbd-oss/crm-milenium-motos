// components/dashboard/embudo-chart.tsx
'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { ETAPAS_PROSPECTO } from '@/lib/constants'

const COLORS_ETAPA: Record<string, string> = {
  'Interesado': '#3b82f6',
  'Cotizó': '#f59e0b',
  'Dio adelanto': '#f97316',
  'Vendido': '#10b981',
  'Desistió': '#6b7280',
}

export function EmbudoChart({
  prospectosPorEtapa,
}: {
  prospectosPorEtapa: Record<string, number>
}) {
  const data = ETAPAS_PROSPECTO.map(e => ({
    etapa: e,
    cantidad: prospectosPorEtapa[e] ?? 0,
  }))

  const total = data.reduce((acc, d) => acc + d.cantidad, 0)

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Embudo de prospectos</h2>
        <p className="text-sm text-muted-foreground">{total} total</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="etapa"
            tick={{ fontSize: 11 }}
            width={90}
          />
          <Tooltip />
          <Bar dataKey="cantidad" name="Prospectos">
            {data.map(entry => (
              <Cell
                key={entry.etapa}
                fill={COLORS_ETAPA[entry.etapa] ?? '#6b7280'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
