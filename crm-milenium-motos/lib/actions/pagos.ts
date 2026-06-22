// lib/actions/pagos.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { pagoSchema, type PagoFormValues } from '@/lib/validations/pago'
import { calcularEstadoPago } from '@/lib/utils/estados'

export async function crearPago(ventaId: string, unidadId: string, data: PagoFormValues) {
  const supabase = createServerClient()
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
  await supabase.from('ventas').update({ estado_pago: nuevoEstadoPago }).eq('id', ventaId)

  // 5. Actualizar estado_comercial en unidad (sin degradar desde Entregada)
  const estadoComercialActual = unidad?.estado_comercial
  if (estadoComercialActual !== 'Entregada') {
    if (nuevoEstadoPago === 'Pagado') {
      await supabase.from('unidades').update({ estado_comercial: 'Vendida' }).eq('id', unidadId)
    } else if (validated.tipo === 'Adelanto' && !estadoComercialActual) {
      const esFirstAdelanto = pagos.filter(p => p.tipo === 'Adelanto').length === 1
      if (esFirstAdelanto) {
        await supabase.from('unidades').update({ estado_comercial: 'Separada' }).eq('id', unidadId)
      }
    }
  }

  revalidatePath(`/unidades/${unidadId}`)
  revalidatePath('/ventas')
}

async function recalcularEstados(supabase: ReturnType<typeof createServerClient>, ventaId: string, unidadId: string) {
  const [{ data: venta }, { data: pagos }, { data: unidad }] = await Promise.all([
    supabase.from('ventas').select('precio_venta').eq('id', ventaId).single(),
    supabase.from('pagos').select('monto').eq('venta_id', ventaId),
    supabase.from('unidades').select('estado_comercial').eq('id', unidadId).single(),
  ])
  if (!venta || !pagos) return

  const suma = pagos.reduce((acc, p) => acc + Number(p.monto), 0)
  const nuevoEstadoPago = calcularEstadoPago(suma, Number(venta.precio_venta))
  await supabase.from('ventas').update({ estado_pago: nuevoEstadoPago }).eq('id', ventaId)

  if (unidad?.estado_comercial !== 'Entregada') {
    if (nuevoEstadoPago === 'Pagado') {
      await supabase.from('unidades').update({ estado_comercial: 'Vendida' }).eq('id', unidadId)
    } else if (suma === 0) {
      await supabase.from('unidades').update({ estado_comercial: null }).eq('id', unidadId)
    } else {
      await supabase.from('unidades').update({ estado_comercial: 'Separada' }).eq('id', unidadId)
    }
  }
}

export async function editarPago(pagoId: string, ventaId: string, unidadId: string, data: PagoFormValues) {
  const supabase = createServerClient()
  const validated = pagoSchema.parse(data)
  const { error } = await supabase.from('pagos').update(validated).eq('id', pagoId)
  if (error) throw new Error(error.message)
  await recalcularEstados(supabase, ventaId, unidadId)
  revalidatePath(`/unidades/${unidadId}`)
  revalidatePath('/ventas')
}

export async function eliminarPago(pagoId: string, ventaId: string, unidadId: string) {
  const supabase = createServerClient()
  const { error } = await supabase.from('pagos').delete().eq('id', pagoId)
  if (error) throw new Error(error.message)
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
