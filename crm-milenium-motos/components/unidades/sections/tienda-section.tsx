'use client'

import { useState } from 'react'
import { actualizarFechaLlegadaTienda } from '@/lib/actions/unidades'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { BadgeLogistico } from '@/components/unidades/estado-badges'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TiendaSection({ unidad }: { unidad: any }) {
  const [fecha, setFecha] = useState(unidad.fecha_llegada_tienda ?? '')
  const [loading, setLoading] = useState(false)

  async function handleGuardar() {
    if (!fecha) return
    setLoading(true)
    try {
      await actualizarFechaLlegadaTienda(unidad.id, fecha)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Estado logístico actual:</span>
        <BadgeLogistico estado={unidad.estado_logistico} />
      </div>
      <div className="max-w-xs space-y-1">
        <Label htmlFor="fecha-tienda">Fecha llegada a tienda</Label>
        <Input
          id="fecha-tienda"
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
        />
      </div>
      <Button size="sm" onClick={handleGuardar} disabled={loading || !fecha}>
        {loading ? 'Guardando...' : 'Guardar'}
      </Button>
    </div>
  )
}
