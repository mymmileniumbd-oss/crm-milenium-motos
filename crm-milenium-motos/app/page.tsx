// app/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (usuario?.rol === 'gerente') redirect('/dashboard')
  redirect('/panel')
}
