// lib/validations/reclamo.ts
import { z } from 'zod'

export const reclamoSchema = z.object({
  tipo: z.enum(['Moto', 'Fibra']),
  fecha_reclamo: z.string().min(1, 'La fecha es requerida'),
  descripcion: z.string().optional(),
  estado: z.enum(['Pendiente', 'Resuelto']),
  taller: z.string().optional(),
  precio: z.number().min(0).optional().nullable(),
})

export type ReclamoFormValues = z.infer<typeof reclamoSchema>
