// app/(vendedor)/tramites/page.tsx
import Link from 'next/link'
import { obtenerTramites } from '@/lib/actions/tramites'

export default async function TramitesPage() {
  const tramites = await obtenerTramites()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trámites</h1>
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        {tramites.length === 0 ? (
          <p className="p-6 text-gray-500 text-center">No hay trámites registrados</p>
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
