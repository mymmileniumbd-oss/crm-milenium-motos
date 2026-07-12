// lib/validations/cliente.ts
import { z } from 'zod'

export const clienteSchema = z.object({
  nombre_completo: z.string().min(1, 'El nombre es requerido'),
  dni: z.string().regex(/^\d{8}$/, 'El DNI debe tener exactamente 8 dígitos'),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  correo: z.union([
    z.string().email('Correo inválido'),
    z.literal(''),
  ]).optional(),
})

export type ClienteFormValues = z.infer<typeof clienteSchema>
