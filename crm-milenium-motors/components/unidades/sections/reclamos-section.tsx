// components/unidades/sections/reclamos-section.tsx
'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { crearReclamo, editarReclamo, actualizarEstadoReclamo } from '@/lib/actions/reclamos'
import { ReclamoForm } from '@/components/reclamos/reclamo-form'
import { Button } from '@/components/ui/button'
import { formatSoles } from '@/lib/utils/format'
import type { ReclamoFormValues } from '@/lib/validations/reclamo'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ReclamosSection({ unidad }: { unidad: any }) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reclamos: any[] = unidad.reclamos ?? []

  async function handleEditar(reclamoId: string, data: ReclamoFormValues) {
    await editarReclamo(reclamoId, unidad.id, data)
    setEditandoId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => { setMostrarForm(f => !f); setEditandoId(null) }}>
          {mostrarForm ? 'Cancelar' : '+ Nuevo reclamo'}
        </Button>
      </div>
      {mostrarForm && (
        <ReclamoForm
          onSubmit={async (d) => {
            await crearReclamo(unidad.id, d)
            setMostrarForm(false)
          }}
        />
      )}
      {reclamos.length === 0 && !mostrarForm && (
        <p className="text-sm text-gray-500">Sin reclamos registrados</p>
      )}
      <div className="space-y-3">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {reclamos.map((r: any) => (
          <div key={r.id} className="border rounded-lg p-3 text-sm space-y-1">
            {editandoId === r.id ? (
              <ReclamoForm
                submitLabel="Guardar cambios"
                defaultValues={{
                  tipo: r.tipo,
                  fecha_reclamo: r.fecha_reclamo,
                  estado: r.estado,
                  descripcion: r.descripcion ?? '',
                  taller: r.taller ?? '',
                  precio: r.precio ?? null,
                }}
                onSubmit={(data) => handleEditar(r.id, data)}
                onCancel={() => setEditandoId(null)}
              />
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      r.tipo === 'Moto' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {r.tipo}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditandoId(r.id)}
                      className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                      title="Editar reclamo"
                    >
                      <Pencil size={13} />
                    </button>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        r.estado === 'Resuelto' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {r.estado}
                    </span>
                  </div>
                </div>
                {r.descripcion && <p>{r.descripcion}</p>}
                {r.taller && <p className="text-gray-500">Taller: {r.taller}</p>}
                {r.precio && <p className="text-gray-500">Costo: {formatSoles(Number(r.precio))}</p>}
                <p className="text-gray-400">{r.fecha_reclamo}</p>
                {r.fecha_resolucion && (
                  <p className="text-green-700 text-xs">Resuelto el: {r.fecha_resolucion}</p>
                )}
                {r.estado === 'Pendiente' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs"
                    onClick={() => actualizarEstadoReclamo(r.id, unidad.id, 'Resuelto')}
                  >
                    Marcar resuelto
                  </Button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
