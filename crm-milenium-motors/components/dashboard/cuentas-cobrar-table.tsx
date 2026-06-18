// components/dashboard/cuentas-cobrar-table.tsx
import { formatSoles } from '@/lib/utils/format'
import type { CuentaCobrar } from '@/lib/actions/dashboard'

export function CuentasCobrarTable({ cuentas }: { cuentas: CuentaCobrar[] }) {
  const totalPendiente = cuentas.reduce((acc, c) => acc + c.saldo_pendiente, 0)

  return (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Cuentas por cobrar</h2>
        <p className="text-sm font-medium text-red-600">
          {formatSoles(totalPendiente)} pendiente
        </p>
      </div>
      {cuentas.length === 0 ? (
        <p className="text-sm text-gray-500">Sin cuentas por cobrar</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="text-left py-1">Cliente</th>
                <th className="text-left">Modelo</th>
                <th className="text-right">Precio</th>
                <th className="text-right">Pagado</th>
                <th className="text-right font-medium text-red-600">Pendiente</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cuentas.map(c => (
                <tr key={c.id}>
                  <td className="py-2">{c.cliente}</td>
                  <td className="text-xs text-gray-500">{c.modelo}</td>
                  <td className="text-right">{formatSoles(c.precio_venta)}</td>
                  <td className="text-right text-green-600">{formatSoles(c.pagado)}</td>
                  <td className="text-right font-medium text-red-600">
                    {formatSoles(c.saldo_pendiente)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
