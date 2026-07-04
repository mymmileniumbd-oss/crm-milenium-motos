// lib/validations/garantia.ts
import { z } from 'zod'

export const garantiaSchema = z.object({
  garantia_moto_km: z.number().min(0, 'El kilometraje no puede ser negativo').optional().nullable(),
  garantia_moto_inicio: z.string().optional().nullable(),
  garantia_fibra_inicio: z.string().optional().nullable(),
  garantia_fibra_vencimiento: z.string().optional().nullable(),
})

export type GarantiaFormValues = z.infer<typeof garantiaSchema>
