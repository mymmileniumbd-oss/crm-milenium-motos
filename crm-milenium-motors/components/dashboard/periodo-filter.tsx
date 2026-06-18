// components/dashboard/periodo-filter.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

function getMesActual() {
  const hoy = new Date()
  const desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
  const hasta = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0]
  return { desde, hasta }
}

function getMesAnterior() {
  const hoy = new Date()
  const desde = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1).toISOString().split('T')[0]
  const hasta = new Date(hoy.getFullYear(), hoy.getMonth(), 0).toISOString().split('T')[0]
  return { desde, hasta }
}

export function PeriodoFilter() {
  const router = useRouter()
  const params = useSearchParams()
  const [desde, setDesde] = useState(params.get('desde') ?? getMesActual().desde)
  const [hasta, setHasta] = useState(params.get('hasta') ?? getMesActual().hasta)

  function aplicar(d: string, h: string) {
    router.push(`/dashboard?desde=${d}&hasta=${h}`)
  }

  return (
    <div className="bg-white border rounded-lg p-4 flex flex-wrap gap-4 items-end">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const m = getMesActual()
            setDesde(m.desde)
            setHasta(m.hasta)
            aplicar(m.desde, m.hasta)
          }}
        >
          Mes actual
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const m = getMesAnterior()
            setDesde(m.desde)
            setHasta(m.hasta)
            aplicar(m.desde, m.hasta)
          }}
        >
          Mes anterior
        </Button>
      </div>
      <div className="flex items-end gap-2">
        <div>
          <Label className="text-xs">Desde</Label>
          <Input
            type="date"
            value={desde}
            onChange={e => setDesde(e.target.value)}
            className="mt-1 w-36"
          />
        </div>
        <div>
          <Label className="text-xs">Hasta</Label>
          <Input
            type="date"
            value={hasta}
            onChange={e => setHasta(e.target.value)}
            className="mt-1 w-36"
          />
        </div>
        <Button size="sm" onClick={() => aplicar(desde, hasta)}>
          Aplicar
        </Button>
      </div>
    </div>
  )
}
