// lib/constants.ts
export const COLORES_MOTO = ['Rojo', 'Azul', 'Verde', 'Negro', 'Amarillo'] as const
export type ColorMoto = typeof COLORES_MOTO[number]

export const MODELOS_MOTO = [
  'Deluxe GS',
  'Deluxe GLP',
  'Duramax GS',
  'Duramax GLP',
  'Duramax GNV',
] as const

export type ModeloMoto = typeof MODELOS_MOTO[number]

export const ESTADOS_LOGISTICO = ['Pedida', 'En fibrero', 'En tienda'] as const
export const ESTADOS_COMERCIAL = ['Separada', 'Vendida', 'Entregada'] as const
export const ETAPAS_PROSPECTO = ['Interesado', 'Cotizó', 'Dio adelanto', 'Vendido', 'Desistió'] as const
export const ORIGENES_PROSPECTO = ['Facebook', 'Referido', 'Visita a tienda', 'Otro'] as const
export const TIPOS_PAGO = ['Adelanto', 'Saldo', 'Contado'] as const
export const TIPOS_VENTA = ['Contado', 'Separación'] as const
export const TIPOS_DOCUMENTO = ['Factura', 'Boleta'] as const
export const TIPOS_RECLAMO = ['Moto', 'Fibra'] as const
export const ESTADOS_RECLAMO = ['Pendiente', 'Resuelto'] as const
export const SUNARP_ESTADOS = ['Ingreso', 'En Calificación', 'Inscrito'] as const
export const AAP_ESTADOS = ['Pago', 'Recojo'] as const
