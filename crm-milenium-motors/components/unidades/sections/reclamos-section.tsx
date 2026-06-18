// components/unidades/sections/reclamos-section.tsx
'use client'

import { useState } from 'react'
import { crearReclamo, actualizarEstadoReclamo } from '@/lib/actions/reclamos'
import { ReclamoForm } from '@/components/reclamos/reclamo-form'
import { Button } from '@/components/ui/button'
import { formatSoles } from '@/lib/utils/format'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ReclamosSection({ unidad }: { unidad: any }) {
  const [mostrarForm, setMostrarForm] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reclamos: any[] = unidad.reclamos ?? []

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => setMostrarForm((f) => !f)}>
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
            <div className="flex items-start justify-between">
              <span
                className={`text-xs px-2 py-0.5 rounded font-medium ${
                  r.tipo === 'Moto' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                }`}
              >
                {r.tipo}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  r.estado === 'Resuelto' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {r.estado}
              </span>
            </div>
            {r.descripcion && <p>{r.descripcion}</p>}
            {r.taller && <p className="text-gray-500">Taller: {r.taller}</p>}
            {r.precio && <p className="text-gray-500">Costo: {formatSoles(Number(r.precio))}</p>}
            <p className="text-gray-400">{r.fecha_reclamo}</p>
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
          </div>
        ))}
      </div>
    </div>
  )
}
