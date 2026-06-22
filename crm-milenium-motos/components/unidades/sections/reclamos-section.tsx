// components/unidades/sections/reclamos-section.tsx
'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { crearReclamo, editarReclamo, actualizarEstadoReclamo } from '@/lib/actions/reclamos'
import { ReclamoForm } from '@/components/reclamos/reclamo-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatSoles } from '@/lib/utils/format'
import type { ReclamoFormValues } from '@/lib/validations/reclamo'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ReclamosSection({ unidad }: { unidad: any }) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [resolviendoId, setResolviendoId] = useState<string | null>(null)
  const [fechaResolucion, setFechaResolucion] = useState(new Date().toISOString().split('T')[0])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reclamos: any[] = unidad.reclamos ?? []

  async function handleEditar(reclamoId: string, data: ReclamoFormValues) {
    await editarReclamo(reclamoId, unidad.id, data)
    setEditandoId(null)
  }

  async function handleResolver(reclamoId: string) {
    await actualizarEstadoReclamo(reclamoId, unidad.id, 'Resuelto', fechaResolucion)
    setResolviendoId(null)
    setFechaResolucion(new Date().toISOString().split('T')[0])
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
        <p className="text-sm text-muted-foreground">Sin reclamos registrados</p>
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
                      className="p-1 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
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
                {r.taller && <p className="text-muted-foreground">Taller: {r.taller}</p>}
                {r.precio && <p className="text-muted-foreground">Costo: {formatSoles(Number(r.precio))}</p>}
                <p className="text-muted-foreground">{r.fecha_reclamo}</p>
                {r.fecha_resolucion && (
                  <p className="text-green-700 text-xs">Resuelto el: {r.fecha_resolucion}</p>
                )}
                {r.estado === 'Pendiente' && resolviendoId !== r.id && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs"
                    onClick={() => { setResolviendoId(r.id); setFechaResolucion(new Date().toISOString().split('T')[0]) }}
                  >
                    Marcar resuelto
                  </Button>
                )}
                {resolviendoId === r.id && (
                  <div className="flex items-center gap-2 pt-1">
                    <label className="text-xs text-muted-foreground whitespace-nowrap">Fecha resolución:</label>
                    <Input
                      type="date"
                      value={fechaResolucion}
                      onChange={e => setFechaResolucion(e.target.value)}
                      className="h-7 text-xs w-36"
                    />
                    <Button size="sm" className="h-7 text-xs" onClick={() => handleResolver(r.id)}>
                      Confirmar
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setResolviendoId(null)}>
                      Cancelar
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
