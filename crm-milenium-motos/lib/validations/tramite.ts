// lib/validations/tramite.ts
import { z } from 'zod'
import { SUNARP_ESTADOS, AAP_ESTADOS } from '@/lib/constants'

export const tramiteSchema = z.object({
  unidad_id: z.string().uuid('ID de unidad requerido'),
  tipo: z.enum(['SUNARP', 'AAP']),
  estado: z.union([z.enum(SUNARP_ESTADOS), z.enum(AAP_ESTADOS)]),
  fecha_ingreso: z.string().optional().nullable(),
  fecha_inscripcion: z.string().optional().nullable(),
  observaciones: z.string().optional(),
})

export type TramiteFormValues = z.infer<typeof tramiteSchema>
