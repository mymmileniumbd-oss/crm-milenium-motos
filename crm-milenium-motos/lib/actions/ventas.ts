// lib/actions/ventas.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { requireRol } from '@/lib/supabase/auth'
import { ventaSchema, ventaUpdateSchema, type VentaFormValues } from '@/lib/validations/venta'
import { calcularEstadoPago, calcularEstadoComercial } from '@/lib/utils/estados'

export async function crearVenta(unidadId: string, data: VentaFormValues) {
  const { supabase, user } = await requireRol('vendedor')
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
      vendedor_id: user.id,
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
  const { error: unidadError } = await supabase.from('unidades')
    .update({ cliente_id: validated.cliente_id })
    .eq('id', unidadId).is('cliente_id', null)
  if (unidadError) throw new Error(unidadError.message)

  // Crear trámite vacío automáticamente
  const { error: tramiteError } = await supabase
    .from('tramites').upsert({ unidad_id: unidadId }, { onConflict: 'unidad_id' })
  if (tramiteError) throw new Error(tramiteError.message)

  revalidatePath(`/unidades/${unidadId}`)
  revalidatePath('/ventas')
  return venta
}

export async function actualizarVenta(
  ventaId: string,
  unidadId: string,
  data: { fecha_venta: string; precio_venta: number; documento_tipo?: string | null; documento_numero?: string }
) {
  const { supabase } = await requireRol('vendedor')
  const validated = ventaUpdateSchema.parse(data)

  const { error } = await supabase.from('ventas').update({
    fecha_venta: validated.fecha_venta,
    precio_venta: validated.precio_venta,
    documento_tipo: validated.documento_tipo ?? null,
    documento_numero: validated.documento_numero ?? null,
  }).eq('id', ventaId)
  if (error) throw new Error(error.message)

  // Recalcular estado_pago con el nuevo precio
  const { data: pagos, error: pagosError } = await supabase.from('pagos').select('monto').eq('venta_id', ventaId)
  if (pagosError) throw new Error(pagosError.message)
  const suma = (pagos ?? []).reduce((acc, p) => acc + Number(p.monto), 0)
  const nuevoEstado = calcularEstadoPago(suma, validated.precio_venta)
  const { error: estadoPagoError } = await supabase
    .from('ventas').update({ estado_pago: nuevoEstado }).eq('id', ventaId)
  if (estadoPagoError) throw new Error(estadoPagoError.message)

  // Actualizar estado_comercial si corresponde (sin degradar desde Entregada)
  const { data: unidad, error: unidadReadError } = await supabase
    .from('unidades').select('estado_comercial').eq('id', unidadId).single()
  if (unidadReadError) throw new Error(unidadReadError.message)
  const estadoComercialActual = unidad?.estado_comercial ?? null
  const nuevoEstadoComercial = calcularEstadoComercial({
    estadoActual: estadoComercialActual,
    estadoPago: nuevoEstado,
    puedeSepararDesdeNull: false,
    sinPagos: false,
  })
  if (nuevoEstadoComercial !== estadoComercialActual) {
    const { error: e } = await supabase
      .from('unidades').update({ estado_comercial: nuevoEstadoComercial }).eq('id', unidadId)
    if (e) throw new Error(e.message)
  }

  revalidatePath(`/unidades/${unidadId}`)
  revalidatePath('/ventas')
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
    .select('*, unidades(n_motor, modelo, fecha_entrega), clientes(nombre_completo)')
    .eq('seguimiento_7dias_hecho', false)
    .order('fecha_venta', { ascending: true })
  if (error) throw new Error(error.message)

  // Solo mostramos ventas cuya unidad ya fue entregada hace más de 7 días
  return (data ?? []).filter(v => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unidad = Array.isArray(v.unidades) ? (v.unidades as any[])[0] : v.unidades
    return unidad?.fecha_entrega && unidad.fecha_entrega <= fechaLimite
  })
}

export async function marcarSeguimientoHecho(ventaId: string) {
  const { supabase } = await requireRol('vendedor')
  const { error } = await supabase
    .from('ventas').update({ seguimiento_7dias_hecho: true }).eq('id', ventaId)
  if (error) throw new Error(error.message)
  revalidatePath('/seguimientos')
  revalidatePath('/')
}
