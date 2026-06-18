// lib/actions/ventas.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { ventaSchema, type VentaFormValues } from '@/lib/validations/venta'

export async function crearVenta(unidadId: string, data: VentaFormValues) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const validated = ventaSchema.parse(data)

  // Verificar que la unidad no tiene ya una venta
  const { data: ventaExistente, error: checkError } = await supabase
    .from('ventas').select('id').eq('unidad_id', unidadId).maybeSingle()
  if (checkError) throw new Error('Error al verificar venta existente')
  if (ventaExistente) return { error: 'Esta unidad ya tiene una venta registrada' }

  const { data: venta, error } = await supabase
    .from('ventas')
    .insert({
      unidad_id: unidadId,
      cliente_id: validated.cliente_id,
      vendedor_id: user!.id,
      tipo_venta: validated.tipo_venta,
      fecha_venta: validated.fecha_venta,
      precio_venta: validated.precio_venta,
      documento_tipo: validated.documento_tipo ?? null,
      documento_numero: validated.documento_numero ?? null,
      estado_pago: 'Pendiente',
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  // Asignar cliente a la unidad si no lo tenía
  await supabase.from('unidades')
    .update({ cliente_id: validated.cliente_id })
    .eq('id', unidadId).is('cliente_id', null)

  // Crear trámite vacío automáticamente
  await supabase.from('tramites').upsert({ unidad_id: unidadId }, { onConflict: 'unidad_id' })

  revalidatePath(`/unidades/${unidadId}`)
  revalidatePath('/ventas')
  return venta
}

export async function obtenerVentas() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('ventas')
    .select(`
      id,
      fecha_venta,
      precio_venta,
      estado_pago,
      tipo_venta,
      clientes(id, nombre_completo, dni),
      unidades(id, modelo, n_motor)
    `)
    .order('fecha_venta', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function obtenerVenta(id: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('ventas')
    .select(`
      *,
      clientes(id, nombre_completo, dni),
      unidades(id, modelo, n_motor),
      pagos(id, fecha_pago, monto, tipo, n_recibo, n_operacion)
    `)
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function obtenerSeguimientosPendientes() {
  const supabase = createServerClient()
  const fechaLimite = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('ventas')
    .select('*, unidades(n_motor, modelo), clientes(nombre_completo)')
    .lte('fecha_venta', fechaLimite)
    .eq('seguimiento_7dias_hecho', false)
    .order('fecha_venta', { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

export async function marcarSeguimientoHecho(ventaId: string) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('ventas').update({ seguimiento_7dias_hecho: true }).eq('id', ventaId)
  if (error) throw new Error(error.message)
  revalidatePath('/seguimientos')
  revalidatePath('/')
}
