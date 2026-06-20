'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function TramitesFiltro() {
  const router = useRouter()
  const params = useSearchParams()
  const mesActual = new Date().getMonth() + 1
  const anioActual = new Date().getFullYear()

  const mes = Number(params.get('mes') || mesActual)
  const anio = Number(params.get('anio') || anioActual)

  function actualizar(nuevoMes: number, nuevoAnio: number) {
    router.push(`?mes=${nuevoMes}&anio=${nuevoAnio}`)
  }

  const anios = [anioActual - 1, anioActual, anioActual + 1]

  return (
    <div className="flex items-center gap-2">
      <select
        value={mes}
        onChange={e => actualizar(Number(e.target.value), anio)}
        className="border rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
      >
        {MESES.map((nombre, i) => (
          <option key={i + 1} value={i + 1}>{nombre}</option>
        ))}
      </select>
      <select
        value={anio}
        onChange={e => actualizar(mes, Number(e.target.value))}
        className="border rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
      >
        {anios.map(a => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>
    </div>
  )
}
