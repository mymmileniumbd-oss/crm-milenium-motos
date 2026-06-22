// components/unidades/sections/pagos-section.tsx
'use client'

import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { crearPago, editarPago, eliminarPago } from '@/lib/actions/pagos'
import { PagoForm } from '@/components/ventas/pago-form'
import { Button } from '@/components/ui/button'
import { formatSoles } from '@/lib/utils/format'
import type { PagoFormValues } from '@/lib/validations/pago'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PagosSection({ unidad }: { unidad: any }) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const venta = unidad.ventas?.[0]

  if (!venta) {
    return <p className="text-sm text-muted-foreground">Registra primero la venta</p>
  }

  const pagos = venta.pagos ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sumaPagos = pagos.reduce((acc: number, p: any) => acc + Number(p.monto), 0)
  const saldoPendiente = Number(venta.precio_venta) - sumaPagos

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleEliminar(pagoId: string) {
    if (!window.confirm('¿Eliminar este pago? Esta acción no se puede deshacer.')) return
    await eliminarPago(pagoId, venta.id, unidad.id)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleEditar(pagoId: string, data: PagoFormValues) {
    await editarPago(pagoId, venta.id, unidad.id, data)
    setEditandoId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="text-muted-foreground">Saldo pendiente: </span>
          <span className={`font-semibold ${saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatSoles(saldoPendiente)}
          </span>
        </div>
        <Button size="sm" variant="outline" onClick={() => { setMostrarForm(f => !f); setEditandoId(null) }}>
          {mostrarForm ? 'Cancelar' : '+ Registrar pago'}
        </Button>
      </div>

      {mostrarForm && (
        <PagoForm
          submitLabel="Registrar pago"
          onSubmit={async (data) => {
            await crearPago(venta.id, unidad.id, data)
            setMostrarForm(false)
          }}
          onCancel={() => setMostrarForm(false)}
        />
      )}

      {pagos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin pagos registrados</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground border-b">
              <tr>
                <th className="text-left py-1">Fecha</th>
                <th className="text-left">Tipo</th>
                <th className="text-right pr-6">Monto</th>
                <th className="text-left pl-2">Recibo</th>
                <th className="text-left">Operación</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {pagos.map((p: any) => (
                <>
                  <tr key={p.id}>
                    <td className="py-2">{p.fecha_pago}</td>
                    <td>{p.tipo}</td>
                    <td className="text-right font-medium pr-6">{formatSoles(Number(p.monto))}</td>
                    <td className="pl-2">{p.n_recibo}</td>
                    <td className="text-muted-foreground">{p.n_operacion}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setEditandoId(editandoId === p.id ? null : p.id)}
                          className="p-1 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                          title="Editar pago"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleEliminar(p.id)}
                          className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar pago"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editandoId === p.id && (
                    <tr key={`edit-${p.id}`}>
                      <td colSpan={6} className="py-3 px-1 bg-secondary/40">
                        <PagoForm
                          submitLabel="Guardar cambios"
                          defaultValues={{
                            fecha_pago: p.fecha_pago,
                            monto: Number(p.monto),
                            tipo: p.tipo,
                            n_recibo: p.n_recibo ?? '',
                            n_operacion: p.n_operacion ?? '',
                          }}
                          onSubmit={(data) => handleEditar(p.id, data)}
                          onCancel={() => setEditandoId(null)}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
