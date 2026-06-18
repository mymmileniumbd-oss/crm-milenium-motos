'use client'

import { useState } from 'react'
import { actualizarEstadoLogistico } from '@/lib/actions/unidades'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BadgeComercial } from '@/components/unidades/estado-badges'
import { ESTADOS_LOGISTICO } from '@/lib/constants'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DatosGeneralesSection({ unidad }: { unidad: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Modelo:</span>
          <p className="font-medium">{unidad.modelo}</p>
        </div>
        <div>
          <span className="text-gray-500">Tipo ingreso:</span>
          <p>{unidad.tipo_ingreso}</p>
        </div>
        <div>
          <span className="text-gray-500">N° Motor:</span>
          <p className="font-mono font-medium">{unidad.n_motor}</p>
        </div>
        <div>
          <span className="text-gray-500">N° Chasis:</span>
          <p className="font-mono font-medium">{unidad.n_chasis}</p>
        </div>
        <div>
          <span className="text-gray-500">Color:</span>
          <p>{unidad.color ?? '—'}</p>
        </div>
        <div>
          <span className="text-gray-500">Año:</span>
          <p>{unidad.anio ?? '—'}</p>
        </div>
        <div>
          <span className="text-gray-500">DUA - ITEM:</span>
          <p>{unidad.dua_item ?? '—'}</p>
        </div>
        <div>
          <span className="text-gray-500">Cliente:</span>
          <p>
            {unidad.clientes
              ? unidad.clientes.nombre_completo
              : <span className="text-gray-400">Sin cliente</span>
            }
          </p>
        </div>
      </div>
      <div className="flex gap-6 pt-2">
        <div>
          <p className="text-xs text-gray-500 mb-1">Estado logístico</p>
          <EstadoLogisticoSelector unidadId={unidad.id} estadoActual={unidad.estado_logistico} />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Estado comercial</p>
          <BadgeComercial estado={unidad.estado_comercial} />
        </div>
      </div>
    </div>
  )
}

function EstadoLogisticoSelector({ unidadId, estadoActual }: {
  unidadId: string
  estadoActual: string
}) {
  const [loading, setLoading] = useState(false)

  async function onChange(value: string) {
    setLoading(true)
    try {
      await actualizarEstadoLogistico(unidadId, value)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Select value={estadoActual} onValueChange={onChange} disabled={loading}>
      <SelectTrigger className="w-36 h-7 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ESTADOS_LOGISTICO.map(e => (
          <SelectItem key={e} value={e}>{e}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
