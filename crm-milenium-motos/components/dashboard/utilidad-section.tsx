// components/dashboard/utilidad-section.tsx
import { formatSoles } from '@/lib/utils/format'
import type { UtilidadRow } from '@/lib/actions/dashboard'

export function UtilidadSection({ utilidades }: { utilidades: UtilidadRow[] }) {
  const totalUtilidad = utilidades.reduce((acc, u) => acc + u.utilidad, 0)

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Utilidad del periodo</h2>
        <p
          className={`text-xl font-bold ${
            totalUtilidad >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {formatSoles(totalUtilidad)}
        </p>
      </div>
      {utilidades.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin ventas en el periodo</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground border-b">
              <tr>
                <th className="text-left py-1">Motor</th>
                <th className="text-left">Modelo</th>
                <th className="text-left">Cliente</th>
                <th className="text-right">Venta</th>
                <th className="text-right">Costo</th>
                <th className="text-right">Utilidad</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {utilidades.map((u, i) => (
                <tr key={u.n_motor ?? i}>
                  <td className="py-2 font-mono text-xs">{u.n_motor}</td>
                  <td className="text-xs">{u.modelo}</td>
                  <td className="text-xs">{u.cliente}</td>
                  <td className="text-right">{formatSoles(u.precio_venta)}</td>
                  <td className="text-right text-muted-foreground">{formatSoles(u.costo_total)}</td>
                  <td
                    className={`text-right font-medium ${
                      u.utilidad >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatSoles(u.utilidad)}
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
