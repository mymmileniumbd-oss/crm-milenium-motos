// lib/actions/garantias.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { requireRol } from '@/lib/supabase/auth'
import { garantiaSchema, type GarantiaFormValues } from '@/lib/validations/garantia'

export async function obtenerGarantias() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('garantias')
    .select(`
      id,
      garantia_moto_km,
      garantia_moto_inicio,
      garantia_fibra_inicio,
      garantia_fibra_vencimiento,
      unidad_id,
      unidades(id, modelo, n_motor, estado_comercial, clientes(nombre_completo))
    `)
    .order('garantia_fibra_vencimiento', { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

export async function actualizarGarantia(unidadId: string, data: GarantiaFormValues) {
  const { supabase } = await requireRol('vendedor')
  const validated = garantiaSchema.parse(data)
  const { error } = await supabase
    .from('garantias')
    .upsert({ unidad_id: unidadId, ...validated }, { onConflict: 'unidad_id' })
  if (error) throw new Error(error.message)
  revalidatePath(`/unidades/${unidadId}`)
  revalidatePath('/garantias')
}
