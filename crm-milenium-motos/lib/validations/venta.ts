// lib/validations/venta.ts
import { z } from 'zod'

export const ventaSchema = z.object({
  tipo_venta: z.enum(['Contado', 'Separación']),
  fecha_venta: z.string().min(1, 'La fecha de venta es requerida'),
  precio_venta: z.number().min(0, 'El precio no puede ser negativo'),
  documento_tipo: z.enum(['Factura', 'Boleta']).optional().nullable(),
  documento_numero: z.string().optional(),
  cliente_id: z.string().uuid('Selecciona un cliente'),
})

export type VentaFormValues = z.infer<typeof ventaSchema>

// Subconjunto de ventaSchema usado por actualizarVenta (no permite cambiar
// tipo_venta ni cliente_id, solo los campos editables desde la ficha).
export const ventaUpdateSchema = ventaSchema.pick({
  fecha_venta: true,
  precio_venta: true,
  documento_tipo: true,
  documento_numero: true,
})
