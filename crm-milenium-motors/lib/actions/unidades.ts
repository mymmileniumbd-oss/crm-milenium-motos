// lib/actions/unidades.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { addMonths, format } from 'date-fns'
import { createServerClient } from '@/lib/supabase/server'
import { unidadBaseSchema, compraSchema, fibraSchema, type UnidadBaseValues, type CompraValues, type FibraValues } from '@/lib/validations/unidad'

export interface UnidadFilters {
  modelo?: string
  estado_logistico?: string
  estado_comercial?: string
  tipo_ingreso?: string
}

export async function obtenerUnidades(filters: UnidadFilters = {}) {
  const supabase = createServerClient()
  let query = supabase
    .from('unidades')
    .select('*, clientes(nombre_completo)')
    .order('created_at', { ascending: false })

  if (filters.modelo) query = query.eq('modelo', filters.modelo)
  if (filters.estado_logistico) query = query.eq('estado_logistico', filters.estado_logistico)
  if (filters.estado_comercial === 'Disponible') {
    query = query.is('estado_comercial', null)
  } else if (filters.estado_comercial) {
    query = query.eq('estado_comercial', filters.estado_comercial)
  }
  if (filters.tipo_ingreso) query = query.eq('tipo_ingreso', filters.tipo_ingreso)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function obtenerUnidad(id: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('unidades')
    .select(`
      *,
      clientes(id, nombre_completo, dni, telefono),
      ventas(id, tipo_venta, fecha_venta, precio_venta, estado_pago, documento_tipo, documento_numero, seguimiento_7dias_hecho,
        pagos(id, fecha_pago, monto, n_operacion, n_recibo, tipo)
      ),
      garantias(id, garantia_moto_km, garantia_moto_inicio, garantia_fibra_inicio, garantia_fibra_vencimiento),
      reclamos(id, tipo, fecha_reclamo, descripcion, estado, taller, precio),
      tramites(id, sunarp_estado, sunarp_fecha, aap_estado, aap_fecha)
    `)
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function crearUnidad(data: UnidadBaseValues) {
  const supabase = createServerClient()
  const validated = unidadBaseSchema.parse(data)

  const { data: unidad, error } = await supabase
    .from('unidades').insert(validated).select('id').single()

  if (error) {
    if (error.code === '23505') throw new Error('El N° de motor o chasis ya existe')
    throw new Error(error.message)
  }

  revalidatePath('/unidades')
  redirect(`/unidades/${unidad.id}`)
}

export async function actualizarEstadoLogistico(id: string, estado: string) {
  const ESTADOS_PERMITIDOS = ['Pedida', 'En fibrero', 'En tienda'] as const
  if (!ESTADOS_PERMITIDOS.includes(estado as typeof ESTADOS_PERMITIDOS[number])) {
    throw new Error('Estado logístico inválido')
  }
  const supabase = createServerClient()
  const { error } = await supabase
    .from('unidades').update({ estado_logistico: estado }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/unidades/${id}`)
}

export async function actualizarSeccionCompra(id: string, data: CompraValues) {
  const supabase = createServerClient()
  const validated = compraSchema.parse(data)
  const { error } = await supabase.from('unidades').update(validated).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/unidades/${id}`)
}

export async function actualizarSeccionFibra(id: string, data: FibraValues) {
  const supabase = createServerClient()
  const validated = fibraSchema.parse(data)
  const { error } = await supabase.from('unidades').update(validated).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/unidades/${id}`)
}

export async function actualizarFechaLlegadaTienda(id: string, fecha: string) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('unidades').update({ fecha_llegada_tienda: fecha }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/unidades/${id}`)
}

export async function asignarCliente(unidadId: string, clienteId: string) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('unidades').update({ cliente_id: clienteId }).eq('id', unidadId)
  if (error) throw new Error(error.message)
  revalidatePath(`/unidades/${unidadId}`)
}

export async function marcarEntregada(unidadId: string, fechaEntrega: string, fechaVenta: string) {
  if (fechaVenta && new Date(fechaEntrega) < new Date(fechaVenta)) {
    throw new Error('La fecha de entrega no puede ser anterior a la fecha de venta')
  }
  const supabase = createServerClient()

  const { data: unidad, error: checkError } = await supabase
    .from('unidades').select('estado_comercial').eq('id', unidadId).single()
  if (checkError || !unidad) throw new Error('Unidad no encontrada')
  if (unidad.estado_comercial !== 'Vendida') throw new Error('La unidad debe estar en estado Vendida')

  const { error: unidadError } = await supabase
    .from('unidades')
    .update({ estado_comercial: 'Entregada', fecha_entrega: fechaEntrega })
    .eq('id', unidadId)
  if (unidadError) throw new Error(unidadError.message)

  const vencimiento = format(addMonths(new Date(fechaEntrega), 1), 'yyyy-MM-dd')
  const { error: garantiaError } = await supabase
    .from('garantias')
    .upsert(
      {
        unidad_id: unidadId,
        garantia_moto_km: 24000,
        garantia_moto_inicio: fechaEntrega,
        garantia_fibra_inicio: fechaEntrega,
        garantia_fibra_vencimiento: vencimiento,
      },
      { onConflict: 'unidad_id' }
    )
  if (garantiaError) throw new Error(garantiaError.message)

  revalidatePath(`/unidades/${unidadId}`)
}
