// components/unidades/sections/venta-section.tsx
'use client'

import { useState } from 'react'
import { crearVenta } from '@/lib/actions/ventas'
import { VentaForm } from '@/components/ventas/venta-form'
import { BadgeEstadoPago } from '@/components/unidades/estado-badges'
import { MarcarEntregadaButton } from '@/components/unidades/marcar-entregada-button'
import { Button } from '@/components/ui/button'
import { formatSoles } from '@/lib/utils/format'

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unidad: any
  clientes: { id: string; nombre_completo: string; dni: string }[]
}

export function VentaSection({ unidad, clientes }: Props) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const venta = unidad.ventas?.[0]

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
      {unidad.estado_comercial === 'Vendida' && (
        <MarcarEntregadaButton unidadId={unidad.id} fechaVenta={venta.fecha_venta} />
      )}
    </div>
  )
}
