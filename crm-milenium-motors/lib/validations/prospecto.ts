// lib/validations/prospecto.ts
import { z } from 'zod'
import { MODELOS_MOTO, ORIGENES_PROSPECTO, ETAPAS_PROSPECTO } from '@/lib/constants'

export const prospectoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  telefono: z.string().optional(),
  modelo_interes: z.enum(MODELOS_MOTO).optional().nullable(),
  origen: z.enum(ORIGENES_PROSPECTO).optional().nullable(),
  etapa: z.enum(ETAPAS_PROSPECTO),
  notas: z.string().optional(),
  vendedor_id: z.string().uuid().optional().nullable(),
})

export type ProspectoFormValues = z.infer<typeof prospectoSchema>
