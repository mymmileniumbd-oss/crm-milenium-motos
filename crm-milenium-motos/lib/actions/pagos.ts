// lib/actions/pagos.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { requireRol } from '@/lib/supabase/auth'
import { pagoSchema, type PagoFormValues } from '@/lib/validations/pago'
import { calcularEstadoPago, calcularEstadoComercial } from '@/lib/utils/estados'

export async function crearPago(ventaId: string, unidadId: string, data: PagoFormValues) {
  const { supabase } = await requireRol('vendedor')
  const validated = pagoSchema.parse(data)

  // 1. Obtener venta y estado_comercial actual de la unidad
  const [{ data: venta, error: ventaErr }, { data: unidad, error: unidadErr }] = await Promise.all([
    supabase.from('ventas').select('precio_venta').eq('id', ventaId).single(),
    supabase.from('unidades').select('estado_comercial').eq('id', unidadId).single(),
  ])
  if (ventaErr || !venta) throw new Error('Venta no encontrada')
  if (unidadErr) throw new Error(unidadErr.message)

  // 2. Insertar pago
  const { error: pagoError } = await supabase
    .from('pagos').insert({ ...validated, venta_id: ventaId })
  if (pagoError) throw new Error(pagoError.message)

  // 3. Recalcular suma de pagos
  const { data: pagos, error: pagosErr } = await supabase
    .from('pagos').select('monto, tipo').eq('venta_id', ventaId)
  if (pagosErr) throw new Error(pagosErr.message)

  const sumaPagos = pagos.reduce((acc, p) => acc + Number(p.monto), 0)
  const nuevoEstadoPago = calcularEstadoPago(sumaPagos, Number(venta.precio_venta))

  // 4. Actualizar estado_pago en venta
  const { error: estadoPagoError } = await supabase
    .from('ventas').update({ estado_pago: nuevoEstadoPago }).eq('id', ventaId)
  if (estadoPagoError) throw new Error(estadoPagoError.message)

  // 5. Actualizar estado_comercial en unidad (sin degradar desde Entregada)
  const estadoComercialActual = unidad?.estado_comercial ?? null
  const esFirstAdelanto = validated.tipo === 'Adelanto' && !estadoComercialActual
    && pagos.filter(p => p.tipo === 'Adelanto').length === 1
  const nuevoEstadoComercial = calcularEstadoComercial({
    estadoActual: estadoComercialActual,
    estadoPago: nuevoEstadoPago,
    puedeSepararDesdeNull: esFirstAdelanto,
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

async function recalcularEstados(supabase: ReturnType<typeof createServerClient>, ventaId: string, unidadId: string) {
  const [
    { data: venta, error: ventaError },
    { data: pagos, error: pagosError },
    { data: unidad, error: unidadError },
  ] = await Promise.all([
    supabase.from('ventas').select('precio_venta').eq('id', ventaId).single(),
    supabase.from('pagos').select('monto').eq('venta_id', ventaId),
    supabase.from('unidades').select('estado_comercial').eq('id', unidadId).single(),
  ])
  if (ventaError) throw new Error(ventaError.message)
  if (pagosError) throw new Error(pagosError.message)
  if (unidadError) throw new Error(unidadError.message)
  if (!venta || !pagos) return

  const suma = pagos.reduce((acc, p) => acc + Number(p.monto), 0)
  const nuevoEstadoPago = calcularEstadoPago(suma, Number(venta.precio_venta))
  const { error: estadoPagoError } = await supabase
    .from('ventas').update({ estado_pago: nuevoEstadoPago }).eq('id', ventaId)
  if (estadoPagoError) throw new Error(estadoPagoError.message)

  const estadoComercialActual = unidad?.estado_comercial ?? null
  const nuevoEstadoComercial = calcularEstadoComercial({
    estadoActual: estadoComercialActual,
    estadoPago: nuevoEstadoPago,
    puedeSepararDesdeNull: true,
    sinPagos: suma === 0,
  })
  if (nuevoEstadoComercial !== estadoComercialActual) {
    const { error: e } = await supabase
      .from('unidades').update({ estado_comercial: nuevoEstadoComercial }).eq('id', unidadId)
    if (e) throw new Error(e.message)
  }
}

export async function editarPago(pagoId: string, ventaId: string, unidadId: string, data: PagoFormValues) {
  const { supabase } = await requireRol('vendedor')
  const validated = pagoSchema.parse(data)
  const { error, count } = await supabase
    .from('pagos').update(validated, { count: 'exact' }).eq('id', pagoId)
  if (error) throw new Error(error.message)
  if (count === 0) throw new Error('No se pudo editar. Verifica los permisos en Supabase.')
  await recalcularEstados(supabase, ventaId, unidadId)
  revalidatePath(`/unidades/${unidadId}`)
  revalidatePath('/ventas')
}

export async function eliminarPago(pagoId: string, ventaId: string, unidadId: string) {
  const { supabase } = await requireRol('vendedor')
  const { error, count } = await supabase
    .from('pagos').delete({ count: 'exact' }).eq('id', pagoId)
  if (error) throw new Error(error.message)
  if (count === 0) throw new Error('No se pudo eliminar. Verifica los permisos en Supabase.')
  await recalcularEstados(supabase, ventaId, unidadId)
  revalidatePath(`/unidades/${unidadId}`)
  revalidatePath('/ventas')
}

export async function obtenerPagosByVenta(ventaId: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('pagos')
    .select('*')
    .eq('venta_id', ventaId)
    .order('fecha_pago', { ascending: true })
  if (error) throw new Error(error.message)
  return data
}
