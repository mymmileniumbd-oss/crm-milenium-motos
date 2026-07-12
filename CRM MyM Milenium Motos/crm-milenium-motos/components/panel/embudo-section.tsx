import { getEmbudoPeriodo } from '@/lib/actions/panel'
import { PeriodoSelector } from './periodo-selector'
import { Card, CardContent } from '@/components/ui/card'
import type { Periodo } from '@/lib/utils/panel'

interface Props {
  periodo: Periodo
  mes: number
  anio: number
}

export async function EmbudoSection({ periodo, mes, anio }: Props) {
  const embudo = await getEmbudoPeriodo(periodo, mes, anio)

  const metricas = [
    { label: 'Leads recibidos', valor: embudo.leadsRecibidos },
    { label: 'Dieron adelanto', valor: embudo.dieronAdelanto },
    { label: 'Ventas cerradas', valor: embudo.ventasCerradas },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[15px] font-extrabold tracking-tight">Embudo del período</h2>
        <PeriodoSelector periodo={periodo} mes={mes} anio={anio} />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {metricas.map(({ label, valor }) => (
          <Card key={label}>
            <CardContent className="pb-3 pt-4">
              <p className="font-mono text-2xl font-bold tabular-nums">{valor}</p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
        <Card className="border-brand/20 bg-brand/5">
          <CardContent className="pb-3 pt-4">
            <p className="font-mono text-2xl font-bold tabular-nums text-brand">
              {embudo.tasaConversion !== null ? `${embudo.tasaConversion}%` : '—'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Tasa de conversión</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
