// lib/actions/tramites.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

export async function actualizarTramite(
  unidadId: string,
  data: {
    sunarp_estado?: string | null
    sunarp_fecha?: string | null
    aap_estado?: string | null
    aap_fecha?: string | null
  }
) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('tramites')
    .upsert({ unidad_id: unidadId, ...data }, { onConflict: 'unidad_id' })
  if (error) throw new Error(error.message)
  revalidatePath(`/unidades/${unidadId}`)
  revalidatePath('/tramites')
}

export async function obtenerTramites() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('tramites')
    .select(`
      id,
      sunarp_estado,
      sunarp_fecha,
      aap_estado,
      aap_fecha,
      unidad_id,
      unidades(id, modelo, n_motor, estado_comercial)
    `)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}
