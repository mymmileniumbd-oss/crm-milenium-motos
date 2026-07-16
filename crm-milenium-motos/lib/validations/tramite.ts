// lib/validations/tramite.ts
import { z } from 'zod'
import { SUNARP_ESTADOS, AAP_ESTADOS } from '@/lib/constants'

export const tramiteSchema = z.object({
  sunarp_estado: z.enum(SUNARP_ESTADOS).optional().nullable(),
  sunarp_fecha: z.string().optional().nullable(),
  aap_estado: z.enum(AAP_ESTADOS).optional().nullable(),
  aap_fecha: z.string().optional().nullable(),
})

export type TramiteFormValues = z.infer<typeof tramiteSchema>
