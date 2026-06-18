'use client'

import { useState } from 'react'
import { marcarEntregada } from '@/lib/actions/unidades'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Props {
  unidadId: string
  fechaVenta: string
}

export function MarcarEntregadaButton({ unidadId, fechaVenta }: Props) {
  const [open, setOpen] = useState(false)
  const [fecha, setFecha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirmar() {
    if (!fecha) return
    if (fechaVenta && new Date(fecha) < new Date(fechaVenta)) {
      setError('La fecha de entrega no puede ser anterior a la fecha de venta')
      return
    }
    setLoading(true)
    setError('')
    try {
      await marcarEntregada(unidadId, fecha, fechaVenta)
      setOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Marcar como Entregada
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar entrega</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="fecha-entrega">Fecha de entrega física *</Label>
            <Input
              id="fecha-entrega"
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              min={fechaVenta || undefined}
              className="mt-1"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            onClick={handleConfirmar}
            disabled={loading || !fecha}
            className="w-full"
          >
            {loading ? 'Guardando...' : 'Confirmar entrega'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
