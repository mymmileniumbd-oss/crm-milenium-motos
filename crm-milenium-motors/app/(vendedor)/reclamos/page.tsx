// app/(vendedor)/reclamos/page.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { obtenerReclamos } from '@/lib/actions/reclamos'
import { TramitesFiltro } from '@/components/tramites/tramites-filtro'
import { formatSoles } from '@/lib/utils/format'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export default async function ReclamosPage({
  searchParams,
}: {
  searchParams: { mes?: string; anio?: string }
}) {
  const ahora = new Date()
  const mes = Number(searchParams.mes ?? ahora.getMonth() + 1)
  const anio = Number(searchParams.anio ?? ahora.getFullYear())
  const prefijo = `${anio}-${String(mes).padStart(2, '0')}`

  const todos = await obtenerReclamos()
  const reclamos = todos.filter(r => r.fecha_reclamo?.startsWith(prefijo))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reclamos</h1>
        <Suspense>
          <TramitesFiltro />
        </Suspense>
      </div>
      <p className="text-sm text-gray-500">
        Mostrando reclamos de <span className="font-medium">{MESES[mes - 1]} {anio}</span>
        {' · '}{reclamos.length} resultado{reclamos.length !== 1 ? 's' : ''}
      </p>
      <div className="bg-white rounded-lg border overflow-hidden">
        {reclamos.length === 0 ? (
          <p className="p-6 text-gray-500 text-center">No hay reclamos para este mes</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha reclamo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha resolución</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Unidad</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Descripción</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Taller</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Costo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reclamos.map((r) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const unidad = Array.isArray(r.unidades) ? (r.unidades as any[])[0] : r.unidades

                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{r.fecha_reclamo}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.fecha_resolucion
                        ? <span className="text-green-700">{r.fecha_resolucion}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {unidad ? (
                        <Link href={`/unidades/${unidad.id}`} className="hover:underline font-medium">
                          {unidad.modelo}{' '}
                          <span className="font-mono text-gray-500">{unidad.n_motor}</span>
                        </Link>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        r.tipo === 'Moto' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {r.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs truncate">
                      {r.descripcion ?? <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {r.taller ?? <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {r.precio != null ? formatSoles(Number(r.precio)) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        r.estado === 'Resuelto' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {r.estado}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
