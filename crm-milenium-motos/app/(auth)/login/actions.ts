// app/(auth)/login/actions.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const supabase = createServerClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Credenciales incorrectas. Intente de nuevo.' }
  }

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', data.user.id)
    .single()

  redirect(usuario?.rol === 'gerente' ? '/dashboard' : '/panel')
}

export async function signOut() {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}
