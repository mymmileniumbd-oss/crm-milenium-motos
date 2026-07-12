'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Periodo } from '@/lib/utils/panel'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

interface Props {
  periodo: Periodo
  mes: number
  anio: number
}

export function PeriodoSelector({ periodo, mes, anio }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function ir(p: Periodo, m?: number, a?: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('periodo', p)
    if (m !== undefined && a !== undefined) {
      params.set('mes', String(m))
      params.set('anio', String(a))
    } else {
      params.delete('mes')
      params.delete('anio')
    }
    router.push(`/panel?${params.toString()}`)
  }

  function navMes(delta: number) {
    let m = mes + delta
    let a = anio
    if (m > 12) { m = 1; a++ }
    if (m < 1)  { m = 12; a-- }
    ir('mes', m, a)
  }

  const base = 'rounded-md px-3 py-1.5 text-sm font-semibold transition-colors'
  const active = 'bg-card text-foreground shadow-sm'
  const inactive = 'text-muted-foreground hover:text-foreground'

  return (
    <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
      <button onClick={() => ir('dia')} className={cn(base, periodo === 'dia' ? active : inactive)}>
        Hoy
      </button>
      <button onClick={() => ir('semana')} className={cn(base, periodo === 'semana' ? active : inactive)}>
        Esta semana
      </button>

      {periodo === 'mes' ? (
        <div className={cn(base, active, 'flex items-center gap-0.5 px-1.5')}>
          <button
            onClick={() => navMes(-1)}
            className="rounded p-0.5 hover:bg-secondary/80"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[108px] text-center text-sm">
            {MESES[mes - 1]} {anio}
          </span>
          <button
            onClick={() => navMes(1)}
            className="rounded p-0.5 hover:bg-secondary/80"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button onClick={() => ir('mes', mes, anio)} className={cn(base, inactive)}>
          Este mes
        </button>
      )}
    </div>
  )
}
