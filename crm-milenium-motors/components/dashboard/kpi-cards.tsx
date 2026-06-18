// components/dashboard/kpi-cards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { KPIs } from '@/lib/actions/dashboard'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function KpiCards({ kpis }: { kpis: KPIs }) {
  const cards = [
    {
      title: 'Total Ventas',
      value: kpis.totalVentas.toString(),
      description: 'ventas en el período',
      color: 'text-blue-600',
    },
    {
      title: 'Ingresos Totales',
      value: `S/ ${formatCurrency(kpis.ingresosTotales)}`,
      description: 'suma de pagos en el período',
      color: 'text-green-600',
    },
    {
      title: 'Unidades Entregadas',
      value: kpis.unidadesEntregadas.toString(),
      description: 'unidades con estado Entregada',
      color: 'text-purple-600',
    },
    {
      title: 'Prospectos Nuevos',
      value: kpis.prospectosNuevos.toString(),
      description: 'prospectos creados en el período',
      color: 'text-orange-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <Card key={card.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
