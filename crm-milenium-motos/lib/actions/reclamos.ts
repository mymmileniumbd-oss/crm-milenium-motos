// lib/actions/reclamos.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { reclamoSchema, type ReclamoFormValues } from '@/lib/validations/reclamo'

export async function crearReclamo(unidadId: string, data: ReclamoFormValues) {
  const supabase = createServerClient()
  const validated = reclamoSchema.parse(data)
  const { error } = await supabase.from('reclamos').insert({ ...validated, unidad_id: unidadId })
  if (error) throw new Error(error.message)
  revalidatePath(`/unidades/${unidadId}`)
  revalidatePath('/reclamos')
}

export async function editarReclamo(reclamoId: string, unidadId: string, data: ReclamoFormValues) {
  const supabase = createServerClient()
  const validated = reclamoSchema.parse(data)
  const { error } = await supabase.from('reclamos').update(validated).eq('id', reclamoId)
  if (error) throw new Error(error.message)
  revalidatePath(`/unidades/${unidadId}`)
  revalidatePath('/reclamos')
}

export async function actualizarEstadoReclamo(
  reclamoId: string,
  unidadId: string,
  estado: 'Pendiente' | 'Resuelto',
  fechaResolucion?: string
) {
  const supabase = createServerClient()
  const update: Record<string, unknown> = { estado }
  update.fecha_resolucion = estado === 'Resuelto' ? (fechaResolucion ?? null) : null
  const { error } = await supabase.from('reclamos').update(update).eq('id', reclamoId)
  if (error) throw new Error(error.message)
  revalidatePath(`/unidades/${unidadId}`)
  revalidatePath('/reclamos')
}

export async function obtenerReclamos() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('reclamos')
    .select(`
      id,
      tipo,
      fecha_reclamo,
      fecha_resolucion,
      descripcion,
      estado,
      taller,
      precio,
      unidad_id,
      unidades(id, modelo, n_motor)
    `)
    .order('fecha_reclamo', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}
