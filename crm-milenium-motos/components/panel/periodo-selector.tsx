'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Periodo } from '@/lib/utils/panel'

const opciones: { value: Periodo; label: string }[] = [
  { value: 'dia', label: 'Hoy' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mes' },
]

export function PeriodoSelector({ periodo }: { periodo: Periodo }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function cambiar(p: Periodo) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('periodo', p)
    router.push(`/panel?${params.toString()}`)
  }

  return (
    <div className="flex gap-1 rounded-lg bg-secondary p-1">
      {opciones.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => cambiar(value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-semibold transition-colors',
            periodo === value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
