// lib/utils/estados.ts
export type EstadoPago = 'Pendiente' | 'Parcial' | 'Pagado'
export type EstadoComercial = 'Separada' | 'Vendida' | 'Entregada'

export function calcularEstadoPago(sumaPagos: number, precioVenta: number): EstadoPago {
  if (sumaPagos <= 0) return 'Pendiente'
  if (sumaPagos >= precioVenta) return 'Pagado'
  return 'Parcial'
}
