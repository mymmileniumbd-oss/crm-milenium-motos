// lib/supabase/auth.ts
import { createServerClient } from '@/lib/supabase/server'

export type Rol = 'vendedor' | 'gerente'

// Defensa en profundidad: RLS ya protege la base, pero las Server Actions no
// repetían el chequeo de rol por su cuenta (dependían 100% del middleware).
export async function requireRol(...roles: Rol[]) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: usuario } = await supabase
    .from('usuarios').select('rol').eq('id', user.id).single()

  if (!usuario || !roles.includes(usuario.rol as Rol)) {
    throw new Error('No autorizado')
  }

  return { supabase, user, rol: usuario.rol as Rol }
}
