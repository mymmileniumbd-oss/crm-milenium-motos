// lib/validations/usuario.ts
import { z } from 'zod'

export const usuarioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  correo: z.string().email('Correo inválido'),
  rol: z.enum(['admin', 'vendedor', 'soporte']),
  activo: z.boolean().default(true),
})

export type UsuarioFormValues = z.infer<typeof usuarioSchema>
