// components/unidades/sections/tramites-section.tsx
'use client'

import { useState } from 'react'
import { actualizarTramite } from '@/lib/actions/tramites'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { SUNARP_ESTADOS, AAP_ESTADOS } from '@/lib/constants'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TramitesSection({ unidad }: { unidad: any }) {
  const tramite = unidad.tramites
  const [sunarp, setSunarp] = useState(tramite?.sunarp_estado ?? '')
  const [sunarpFecha, setSunarpFecha] = useState(tramite?.sunarp_fecha ?? '')
  const [aap, setAap] = useState(tramite?.aap_estado ?? '')
  const [aapFecha, setAapFecha] = useState(tramite?.aap_fecha ?? '')
  const [loading, setLoading] = useState(false)

  async function handleGuardar() {
    setLoading(true)
    try {
      await actualizarTramite(unidad.id, {
        sunarp_estado: sunarp || null,
        sunarp_fecha: sunarpFecha || null,
        aap_estado: aap || null,
        aap_fecha: aapFecha || null,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="font-medium text-sm">SUNARP</p>
          <div>
            <Label className="text-xs">Estado</Label>
            <Select value={sunarp} onValueChange={setSunarp}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Sin estado" />
              </SelectTrigger>
              <SelectContent>
                {SUNARP_ESTADOS.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Fecha</Label>
            <Input
              type="date"
              value={sunarpFecha}
              onChange={(e) => setSunarpFecha(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-sm">AAP</p>
          <div>
            <Label className="text-xs">Estado</Label>
            <Select value={aap} onValueChange={setAap}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Sin estado" />
              </SelectTrigger>
              <SelectContent>
                {AAP_ESTADOS.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Fecha</Label>
            <Input
              type="date"
              value={aapFecha}
              onChange={(e) => setAapFecha(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>
      <Button size="sm" onClick={handleGuardar} disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar trámites'}
      </Button>
    </div>
  )
}
