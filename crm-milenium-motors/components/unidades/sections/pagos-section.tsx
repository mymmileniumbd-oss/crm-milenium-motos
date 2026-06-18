// components/unidades/sections/pagos-section.tsx
'use client'

import { useState } from 'react'
import { crearPago } from '@/lib/actions/pagos'
import { PagoForm } from '@/components/ventas/pago-form'
import { Button } from '@/components/ui/button'
import { formatSoles } from '@/lib/utils/format'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PagosSection({ unidad }: { unidad: any }) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const venta = unidad.ventas?.[0]

  if (!venta) {
    return <p className="text-sm text-gray-500">Registra primero la venta</p>
  }

  const pagos = venta.pagos ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sumaPagos = pagos.reduce((acc: number, p: any) => acc + Number(p.monto), 0)
  const saldoPendiente = Number(venta.precio_venta) - sumaPagos

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="text-gray-500">Saldo pendiente: </span>
          <span className={`font-semibold ${saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatSoles(saldoPendiente)}
          </span>
        </div>
        <Button size="sm" variant="outline" onClick={() => setMostrarForm(f => !f)}>
          {mostrarForm ? 'Cancelar' : '+ Registrar pago'}
        </Button>
      </div>
      {mostrarForm && (
        <PagoForm
          onSubmit={async (data) => {
            await crearPago(venta.id, unidad.id, data)
            setMostrarForm(false)
          }}
        />
      )}
      {pagos.length === 0 ? (
        <p className="text-sm text-gray-500">Sin pagos registrados</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="text-left py-1">Fecha</th>
                <th className="text-left">Tipo</th>
                <th className="text-right">Monto</th>
                <th className="text-left">Recibo</th>
                <th className="text-left">Operación</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {pagos.map((p: any) => (
                <tr key={p.id}>
                  <td className="py-2">{p.fecha_pago}</td>
                  <td>{p.tipo}</td>
                  <td className="text-right font-medium">{formatSoles(Number(p.monto))}</td>
                  <td className="font-mono">{p.n_recibo}</td>
                  <td className="text-gray-500">{p.n_operacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
