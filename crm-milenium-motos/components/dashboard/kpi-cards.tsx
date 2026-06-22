// components/dashboard/kpi-cards.tsx
import { TrendingUp, Wallet, PackageCheck, UserPlus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { KPIs } from '@/lib/actions/dashboard'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

type IconTone = { bg: string; fg: string }

export function KpiCards({ kpis }: { kpis: KPIs }) {
  const cards: {
    title: string
    value: string
    description: string
    icon: LucideIcon
    tone: IconTone
  }[] = [
    {
      title: 'Total Ventas',
      value: kpis.totalVentas.toString(),
      description: 'ventas en el período',
      icon: TrendingUp,
      tone: { bg: '#eef3fe', fg: '#1f56d6' },
    },
    {
      title: 'Ingresos Totales',
      value: `S/ ${formatCurrency(kpis.ingresosTotales)}`,
      description: 'suma de pagos en el período',
      icon: Wallet,
      tone: { bg: '#e3f5ec', fg: '#157a4d' },
    },
    {
      title: 'Unidades Entregadas',
      value: kpis.unidadesEntregadas.toString(),
      description: 'unidades con estado Entregada',
      icon: PackageCheck,
      tone: { bg: '#e6edff', fg: '#2348b8' },
    },
    {
      title: 'Prospectos Nuevos',
      value: kpis.prospectosNuevos.toString(),
      description: 'prospectos creados en el período',
      icon: UserPlus,
      tone: { bg: '#fdeede', fg: '#b5560f' },
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ title, value, description, icon: Icon, tone }) => (
        <div key={title} className="rounded-xl border border-border bg-card p-[18px]">
          <div className="mb-3.5 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-muted-foreground">{title}</span>
            <span
              className="flex items-center justify-center rounded-lg p-1.5"
              style={{ backgroundColor: tone.bg, color: tone.fg }}
            >
              <Icon size={16} />
            </span>
          </div>
          <p className="text-[30px] font-extrabold tracking-tight tabular-nums">{value}</p>
          <p className="mt-1.5 text-xs text-muted-foreground">{description}</p>
        </div>
      ))}
    </div>
  )
}
