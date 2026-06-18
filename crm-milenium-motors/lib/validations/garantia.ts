// lib/validations/garantia.ts
import { z } from 'zod'

export const garantiaSchema = z.object({
  unidad_id: z.string().uuid('ID de unidad requerido'),
  fecha_inicio: z.string().min(1, 'La fecha de inicio es requerida'),
  fecha_vencimiento: z.string().min(1, 'La fecha de vencimiento es requerida'),
  descripcion: z.string().optional(),
  estado: z.enum(['Vigente', 'Vencida', 'Anulada']).default('Vigente'),
})

export type GarantiaFormValues = z.infer<typeof garantiaSchema>
