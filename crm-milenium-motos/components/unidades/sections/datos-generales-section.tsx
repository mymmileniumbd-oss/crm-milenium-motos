'use client'

import { useState } from 'react'
import { actualizarEstadoLogistico } from '@/lib/actions/unidades'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BadgeComercial } from '@/components/unidades/estado-badges'
import { ESTADOS_LOGISTICO } from '@/lib/constants'
import { Pencil } from 'lucide-react'

function Campo({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <div className="mb-0.5 text-xs font-semibold text-muted-foreground">{label}</div>
      <div className={`text-[15px] font-semibold ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DatosGeneralesSection({ unidad }: { unidad: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-x-10 gap-y-5">
        <Campo label="Modelo" value={unidad.modelo} />
        <Campo label="Tipo ingreso" value={unidad.tipo_ingreso} />
        <Campo label="N° Motor" value={unidad.n_motor} mono />
        <Campo label="N° Chasis" value={unidad.n_chasis} mono />
        <Campo label="Color" value={unidad.color ?? '—'} />
        <Campo label="Año" value={unidad.anio ?? '—'} />
        <Campo label="DUA - ITEM" value={unidad.dua_item ?? '—'} mono />
        <Campo
          label="Cliente"
          value={
            unidad.clientes ? (
              <span className="text-brand">{unidad.clientes.nombre_completo}</span>
            ) : (
              <span className="text-muted-foreground">Sin cliente</span>
            )
          }
        />
      </div>

      {/* Edición inline — diferenciada con borde azul izquierdo */}
      <div className="relative rounded-[11px] border border-[#cdd9f5] bg-[#f3f6fd] p-5">
        <div className="absolute bottom-4 left-0 top-4 w-[3px] rounded-full bg-brand" />
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dfe9fd] px-2.5 py-1 text-[11px] font-bold text-[#1846b3]">
            <Pencil size={13} /> Edición inline
          </span>
          <span className="text-xs text-muted-foreground">
            Cambia el estado sin salir de la página
          </span>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[200px] flex-1">
            <div className="mb-1.5 text-xs font-semibold text-secondary-foreground/80">
              Estado logístico
            </div>
            <EstadoLogisticoSelector unidadId={unidad.id} estadoActual={unidad.estado_logistico} />
          </div>
          <div className="min-w-[200px] flex-1">
            <div className="mb-1.5 text-xs font-semibold text-secondary-foreground/80">
              Estado comercial
            </div>
            <BadgeComercial estado={unidad.estado_comercial} />
          </div>
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
      <SelectTrigger className="h-10 w-full border-[#cdd9f5] bg-card text-sm font-semibold">
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
