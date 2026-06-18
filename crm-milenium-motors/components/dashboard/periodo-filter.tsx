// components/dashboard/periodo-filter.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

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

function getPeriodoPorMesAnio(mes: number, anio: number) {
  const desde = new Date(anio, mes - 1, 1).toISOString().split('T')[0]
  const hasta = new Date(anio, mes, 0).toISOString().split('T')[0]
  return { desde, hasta }
}

export function PeriodoFilter() {
  const router = useRouter()
  const params = useSearchParams()
  const [desde, setDesde] = useState(params.get('desde') ?? getMesActual().desde)
  const [hasta, setHasta] = useState(params.get('hasta') ?? getMesActual().hasta)

  const hoy = new Date()
  const anioActual = hoy.getFullYear()
  const anios = [anioActual, anioActual - 1, anioActual - 2]

  const [mesSeleccionado, setMesSeleccionado] = useState(hoy.getMonth() + 1)
  const [anioSeleccionado, setAnioSeleccionado] = useState(anioActual)

  function aplicar(d: string, h: string) {
    router.push(`/dashboard?desde=${d}&hasta=${h}`)
  }

  function aplicarMesAnio(mes: number, anio: number) {
    const periodo = getPeriodoPorMesAnio(mes, anio)
    setDesde(periodo.desde)
    setHasta(periodo.hasta)
    aplicar(periodo.desde, periodo.hasta)
  }

  return (
    <div className="bg-white border rounded-lg p-4 flex flex-wrap gap-4 items-end">
      {/* Quick buttons */}
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

      {/* Month/year selector */}
      <div className="flex items-end gap-2">
        <div>
          <Label className="text-xs">Mes</Label>
          <select
            value={mesSeleccionado}
            onChange={e => {
              const mes = Number(e.target.value)
              setMesSeleccionado(mes)
              aplicarMesAnio(mes, anioSeleccionado)
            }}
            className="mt-1 block w-32 rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {MESES.map((nombre, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs">Año</Label>
          <select
            value={anioSeleccionado}
            onChange={e => {
              const anio = Number(e.target.value)
              setAnioSeleccionado(anio)
              aplicarMesAnio(mesSeleccionado, anio)
            }}
            className="mt-1 block w-24 rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {anios.map(a => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom date range */}
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
