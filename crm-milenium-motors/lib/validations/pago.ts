// lib/validations/pago.ts
import { z } from 'zod'

export const pagoSchema = z.object({
  fecha_pago: z.string().min(1, 'La fecha de pago es requerida'),
  monto: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  n_operacion: z.string().optional(),
  n_recibo: z.string().min(1, 'El número de recibo es requerido'),
  tipo: z.enum(['Adelanto', 'Saldo', 'Contado']),
})

export type PagoFormValues = z.infer<typeof pagoSchema>
