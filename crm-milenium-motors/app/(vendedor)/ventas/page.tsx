// app/(vendedor)/ventas/page.tsx
import Link from 'next/link'
import { obtenerVentas } from '@/lib/actions/ventas'
import { BadgeEstadoPago } from '@/components/unidades/estado-badges'
import { formatSoles } from '@/lib/utils/format'

export default async function VentasPage() {
  const ventas = await obtenerVentas()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ventas</h1>
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        {ventas.length === 0 ? (
          <p className="p-6 text-gray-500 text-center">No hay ventas registradas</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Unidad</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Precio</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado pago</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ventas.map(v => {
                // Supabase may return related rows as array or object depending on schema type
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const cliente = Array.isArray(v.clientes) ? (v.clientes as any[])[0] : v.clientes
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const unidad = Array.isArray(v.unidades) ? (v.unidades as any[])[0] : v.unidades
                return (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-700">{v.fecha_venta}</td>
                    <td className="px-4 py-3">
                      {cliente ? (
                        <Link
                          href={`/clientes/${cliente.id}`}
                          className="font-medium hover:underline"
                        >
                          {cliente.nombre_completo}
                        </Link>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {unidad ? (
                        <Link
                          href={`/unidades/${unidad.id}`}
                          className="hover:underline"
                        >
                          {unidad.modelo} <span className="font-mono text-gray-500">{unidad.n_motor}</span>
                        </Link>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatSoles(Number(v.precio_venta))}
                    </td>
                    <td className="px-4 py-3">
                      <BadgeEstadoPago estado={v.estado_pago ?? 'Pendiente'} />
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
