// components/unidades/sections/venta-section.tsx
'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { crearVenta, actualizarVenta } from '@/lib/actions/ventas'
import { VentaForm } from '@/components/ventas/venta-form'
import { BadgeEstadoPago } from '@/components/unidades/estado-badges'
import { MarcarEntregadaButton } from '@/components/unidades/marcar-entregada-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatSoles } from '@/lib/utils/format'

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unidad: any
  clientes: { id: string; nombre_completo: string; dni: string }[]
}

export function VentaSection({ unidad, clientes }: Props) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const venta = unidad.ventas?.[0]

  const [editValues, setEditValues] = useState({
    fecha_venta: venta?.fecha_venta ?? '',
    precio_venta: venta?.precio_venta ?? 0,
    documento_tipo: venta?.documento_tipo ?? '',
    documento_numero: venta?.documento_numero ?? '',
  })

  if (!venta && !mostrarForm) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-500">No hay venta registrada para esta unidad</p>
        <Button size="sm" onClick={() => setMostrarForm(true)}>Registrar venta</Button>
      </div>
    )
  }

  if (!venta && mostrarForm) {
    return (
      <VentaForm
        clientes={clientes}
        clienteIdInicial={unidad.cliente_id ?? undefined}
        onSubmit={async (data) => {
          await crearVenta(unidad.id, data)
          setMostrarForm(false)
        }}
      />
    )
  }

  async function handleGuardar() {
    setGuardando(true)
    try {
      await actualizarVenta(venta.id, unidad.id, {
        fecha_venta: editValues.fecha_venta,
        precio_venta: Number(editValues.precio_venta),
        documento_tipo: editValues.documento_tipo || null,
        documento_numero: editValues.documento_numero || undefined,
      })
      setEditando(false)
    } finally {
      setGuardando(false)
    }
  }

  if (editando) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <label className="text-gray-500 block mb-1">Fecha</label>
            <Input
              type="date"
              value={editValues.fecha_venta}
              onChange={e => setEditValues(v => ({ ...v, fecha_venta: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-gray-500 block mb-1">Precio (S/)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={editValues.precio_venta}
              onChange={e => setEditValues(v => ({ ...v, precio_venta: e.target.valueAsNumber }))}
            />
          </div>
          <div>
            <label className="text-gray-500 block mb-1">Tipo documento</label>
            <Select
              value={editValues.documento_tipo}
              onValueChange={val => setEditValues(v => ({ ...v, documento_tipo: val }))}
            >
              <SelectTrigger><SelectValue placeholder="Sin documento" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Factura">Factura</SelectItem>
                <SelectItem value="Boleta">Boleta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-gray-500 block mb-1">N° Documento</label>
            <Input
              value={editValues.documento_numero}
              onChange={e => setEditValues(v => ({ ...v, documento_numero: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleGuardar} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditando(false)}>
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-500">Tipo:</span>
          <p>{venta.tipo_venta}</p>
        </div>
        <div>
          <span className="text-gray-500">Fecha:</span>
          <p>{venta.fecha_venta}</p>
        </div>
        <div>
          <span className="text-gray-500">Precio:</span>
          <p className="font-medium">{formatSoles(Number(venta.precio_venta))}</p>
        </div>
        <div>
          <span className="text-gray-500">Estado pago:</span>
          <p><BadgeEstadoPago estado={venta.estado_pago} /></p>
        </div>
        {(venta.documento_tipo || venta.documento_numero) && (
          <div>
            <span className="text-gray-500">Documento:</span>
            <p>{venta.documento_tipo} {venta.documento_numero}</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {unidad.estado_comercial === 'Vendida' && (
          <MarcarEntregadaButton unidadId={unidad.id} fechaVenta={venta.fecha_venta} />
        )}
        <button
          onClick={() => {
            setEditValues({
              fecha_venta: venta.fecha_venta,
              precio_venta: venta.precio_venta,
              documento_tipo: venta.documento_tipo ?? '',
              documento_numero: venta.documento_numero ?? '',
            })
            setEditando(true)
          }}
          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
          title="Editar venta"
        >
          <Pencil size={15} />
        </button>
      </div>
    </div>
  )
}
