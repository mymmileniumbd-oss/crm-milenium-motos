// lib/utils/estados.ts
export type EstadoPago = 'Pendiente' | 'Parcial' | 'Pagado'
export type EstadoComercial = 'Separada' | 'Vendida' | 'Entregada'

export function calcularEstadoPago(sumaPagos: number, precioVenta: number): EstadoPago {
  if (sumaPagos <= 0) return 'Pendiente'
  if (sumaPagos >= precioVenta) return 'Pagado'
  return 'Parcial'
}

export interface CalcularEstadoComercialParams {
  estadoActual: EstadoComercial | null
  estadoPago: EstadoPago
  /**
   * Permite pasar de null (o degradar) a 'Separada'. En crearPago solo es true
   * cuando el pago recién creado es el primer Adelanto de la venta; en
   * recalcularEstados (tras editar/eliminar un pago) siempre es true.
   */
  puedeSepararDesdeNull: boolean
  /** true si la suma de pagos es 0 (vuelve a null). Solo aplica en recalcularEstados. */
  sinPagos: boolean
}

// 'Entregada' nunca se degrada (es manual, vía marcarEntregada). Extraído de
// pagos.ts (crearPago/recalcularEstados) y ventas.ts (actualizarVenta), que
// duplicaban esta máquina de estados con matices distintos por sitio.
export function calcularEstadoComercial({
  estadoActual,
  estadoPago,
  puedeSepararDesdeNull,
  sinPagos,
}: CalcularEstadoComercialParams): EstadoComercial | null {
  if (estadoActual === 'Entregada') return 'Entregada'
  if (estadoPago === 'Pagado') return 'Vendida'
  if (sinPagos) return null
  if (puedeSepararDesdeNull) return 'Separada'
  return estadoActual === 'Vendida' ? 'Separada' : estadoActual
}
