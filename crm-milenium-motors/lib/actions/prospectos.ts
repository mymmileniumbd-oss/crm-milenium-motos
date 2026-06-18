// lib/actions/prospectos.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { prospectoSchema, type ProspectoFormValues } from '@/lib/validations/prospecto'

export async function obtenerProspectos() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('prospectos')
    .select('*, usuarios(nombre)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function obtenerProspecto(id: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('prospectos').select('*, usuarios(nombre)').eq('id', id).single()
  if (error) throw new Error(error.message)
  return data
}

export async function crearProspecto(data: ProspectoFormValues) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const validated = prospectoSchema.parse(data)

  const { data: prospecto, error } = await supabase
    .from('prospectos')
    .insert({ ...validated, vendedor_id: user!.id })
    .select('id').single()
  if (error) throw new Error(error.message)

  revalidatePath('/prospectos')
  redirect(`/prospectos/${prospecto.id}`)
}

export async function actualizarEtapaProspecto(id: string, etapa: string) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('prospectos')
    .update({ etapa, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/prospectos')
}

export async function actualizarProspecto(id: string, data: ProspectoFormValues) {
  const supabase = createServerClient()
  const validated = prospectoSchema.parse(data)
  const { error } = await supabase
    .from('prospectos')
    .update({ ...validated, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/prospectos/${id}`)
  revalidatePath('/prospectos')
}
