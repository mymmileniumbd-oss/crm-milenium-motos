// app/(vendedor)/tramites/page.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { obtenerTramites } from '@/lib/actions/tramites'
import { TramitesFiltro } from '@/components/tramites/tramites-filtro'

export default async function TramitesPage({
  searchParams,
}: {
  searchParams: { mes?: string; anio?: string }
}) {
  const ahora = new Date()
  const mes = Number(searchParams.mes ?? ahora.getMonth() + 1)
  const anio = Number(searchParams.anio ?? ahora.getFullYear())
  const prefijo = `${anio}-${String(mes).padStart(2, '0')}`

  const todos = await obtenerTramites()
  const tramites = todos.filter(t =>
    (t.sunarp_fecha && t.sunarp_fecha.startsWith(prefijo)) ||
    (t.aap_fecha && t.aap_fecha.startsWith(prefijo))
  )

  const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trámites</h1>
        <Suspense>
          <TramitesFiltro />
        </Suspense>
      </div>
      <p className="text-sm text-gray-500">
        Mostrando trámites de <span className="font-medium">{MESES[mes - 1]} {anio}</span>
        {' · '}{tramites.length} resultado{tramites.length !== 1 ? 's' : ''}
      </p>
      <div className="bg-white rounded-lg border overflow-hidden">
        {tramites.length === 0 ? (
          <p className="p-6 text-gray-500 text-center">No hay trámites para este mes</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Unidad</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">SUNARP estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">SUNARP fecha</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">AAP estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">AAP fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tramites.map((t) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const unidad = Array.isArray(t.unidades) ? (t.unidades as any[])[0] : t.unidades

                return (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
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
                      {t.sunarp_estado ? (
                        <span className="text-xs px-2 py-0.5 rounded font-medium bg-blue-100 text-blue-700">
                          {t.sunarp_estado}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {t.sunarp_fecha ?? <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {t.aap_estado ? (
                        <span className="text-xs px-2 py-0.5 rounded font-medium bg-purple-100 text-purple-700">
                          {t.aap_estado}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {t.aap_fecha ?? <span className="text-gray-400">—</span>}
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
