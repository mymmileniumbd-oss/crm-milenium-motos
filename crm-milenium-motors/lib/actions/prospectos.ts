// lib/actions/prospectos.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { prospectoSchema, type ProspectoFormValues } from '@/lib/validations/prospecto'
import { clienteSchema } from '@/lib/validations/cliente'

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

export async function convertirEnVenta(
  prospectoId: string,
  clienteData: { nombre_completo: string; dni: string; direccion?: string; telefono?: string; correo?: string },
  unidadId: string,
  ventaData: { tipo_venta: 'Contado' | 'Separación'; fecha_venta: string; precio_venta: number; documento_tipo?: 'Factura' | 'Boleta' | null; documento_numero?: string }
) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Crear cliente
  const clienteValidated = clienteSchema.parse(clienteData)
  const { data: cliente, error: clienteError } = await supabase
    .from('clientes')
    .insert({ ...clienteValidated, correo: clienteValidated.correo || null })
    .select('id').single()
  if (clienteError) {
    if (clienteError.code === '23505') throw new Error('El DNI ya está registrado')
    throw new Error(clienteError.message)
  }

  // 2. Crear venta
  const { error: ventaError } = await supabase.from('ventas').insert({
    unidad_id: unidadId,
    cliente_id: cliente.id,
    vendedor_id: user!.id,
    tipo_venta: ventaData.tipo_venta,
    fecha_venta: ventaData.fecha_venta,
    precio_venta: ventaData.precio_venta,
    documento_tipo: ventaData.documento_tipo ?? null,
    documento_numero: ventaData.documento_numero ?? null,
    estado_pago: 'Pendiente',
  })
  if (ventaError) throw new Error(ventaError.message)

  // 3. Asignar cliente a la unidad
  await supabase.from('unidades').update({ cliente_id: cliente.id }).eq('id', unidadId)

  // 4. Crear trámite vacío
  await supabase.from('tramites').upsert({ unidad_id: unidadId }, { onConflict: 'unidad_id' })

  // 5. Marcar prospecto como Vendido
  await supabase.from('prospectos')
    .update({ etapa: 'Vendido', updated_at: new Date().toISOString() })
    .eq('id', prospectoId)

  revalidatePath('/prospectos')
  revalidatePath('/unidades')
  redirect(`/unidades/${unidadId}`)
}
