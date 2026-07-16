// lib/actions/clientes.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { requireRol } from '@/lib/supabase/auth'
import { clienteSchema, type ClienteFormValues } from '@/lib/validations/cliente'

export async function crearCliente(data: ClienteFormValues) {
  const { supabase } = await requireRol('vendedor')
  const validated = clienteSchema.parse(data)
  const payload = { ...validated, correo: validated.correo || null }

  const { data: cliente, error } = await supabase
    .from('clientes').insert(payload).select('id').single()

  if (error) {
    if (error.code === '23505') throw new Error('El DNI ya está registrado')
    throw new Error(error.message)
  }

  revalidatePath('/clientes')
  redirect(`/clientes/${cliente.id}`)
}

export async function obtenerClientes() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('clientes').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function obtenerCliente(id: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('clientes')
    .select(`*, unidades(id, n_motor, modelo, estado_logistico, estado_comercial), ventas(id, fecha_venta, precio_venta, estado_pago)`)
    .eq('id', id).single()
  if (error) throw new Error(error.message)
  return data
}

export async function actualizarCliente(id: string, data: ClienteFormValues) {
  const { supabase } = await requireRol('vendedor')
  const validated = clienteSchema.parse(data)
  const payload = { ...validated, correo: validated.correo || null }
  const { error } = await supabase.from('clientes').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/clientes/${id}`)
  revalidatePath('/clientes')
}
