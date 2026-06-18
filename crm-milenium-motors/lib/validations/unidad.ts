// lib/validations/unidad.ts
import { z } from 'zod'
import { MODELOS_MOTO } from '@/lib/constants'

export const unidadBaseSchema = z.object({
  n_motor: z.string().min(1, 'N° de motor requerido'),
  n_chasis: z.string().min(1, 'N° de chasis requerido'),
  modelo: z.enum(MODELOS_MOTO, { error: 'Selecciona un modelo' }),
  tipo_ingreso: z.enum(['Bajo pedido', 'Stock']),
  estado_logistico: z.enum(['Pedida', 'En fibrero', 'En tienda']),
  dua_item: z.string().optional(),
  cliente_id: z.string().uuid().optional().nullable(),
})

export const compraSchema = z.object({
  factura_compra_moto: z.string().optional(),
  precio_compra_moto: z.number().min(0).optional().nullable(),
  fecha_compra: z.string().optional().nullable(),
  fecha_pago_compra: z.string().optional().nullable(),
  n_operacion_pago_compra: z.string().optional(),
})

export const fibraSchema = z.object({
  proveedor_fibra: z.string().optional(),
  fecha_llegada_fibrero: z.string().optional().nullable(),
  fecha_pago_fibra: z.string().optional().nullable(),
  n_operacion_fibra: z.string().optional(),
  factura_fibra: z.string().optional(),
  precio_fibra: z.number().min(0).optional().nullable(),
})

export type UnidadBaseValues = z.infer<typeof unidadBaseSchema>
export type CompraValues = z.infer<typeof compraSchema>
export type FibraValues = z.infer<typeof fibraSchema>
