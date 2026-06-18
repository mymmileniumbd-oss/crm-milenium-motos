// lib/actions/dashboard.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'

export interface PeriodoFilter {
  desde: string  // 'YYYY-MM-DD'
  hasta: string  // 'YYYY-MM-DD'
}

export interface UtilidadRow {
  n_motor: string | null
  modelo: string | null
  cliente: string | null
  fecha_venta: string | null
  precio_venta: number
  costo_total: number
  utilidad: number
}

export interface CuentaCobrar {
  id: string
  cliente: string | null
  modelo: string | null
  n_motor: string | null
  precio_venta: number
  pagado: number
  saldo_pendiente: number
}

export async function getDatosVentas(periodo: PeriodoFilter) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('ventas')
    .select('precio_venta, unidades(modelo, precio_compra_moto, precio_fibra)')
    .gte('fecha_venta', periodo.desde)
    .lte('fecha_venta', periodo.hasta)
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getDatosCompras(periodo: PeriodoFilter) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('unidades')
    .select('modelo, precio_compra_moto, precio_fibra, fecha_compra')
    .gte('fecha_compra', periodo.desde)
    .lte('fecha_compra', periodo.hasta)
    .not('fecha_compra', 'is', null)
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getUtilidadPorUnidad(periodo: PeriodoFilter): Promise<UtilidadRow[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('ventas')
    .select('precio_venta, fecha_venta, clientes(nombre_completo), unidades(n_motor, modelo, precio_compra_moto, precio_fibra)')
    .gte('fecha_venta', periodo.desde)
    .lte('fecha_venta', periodo.hasta)
  if (error) throw new Error(error.message)

  return (data ?? []).map(v => {
    const unidad = v.unidades as { n_motor?: string; modelo?: string; precio_compra_moto?: number | null; precio_fibra?: number | null } | null
    const cliente = v.clientes as { nombre_completo?: string } | null
    const costoMoto = Number(unidad?.precio_compra_moto ?? 0)
    const costoFibra = Number(unidad?.precio_fibra ?? 0)
    const utilidad = Number(v.precio_venta) - costoMoto - costoFibra
    return {
      n_motor: unidad?.n_motor ?? null,
      modelo: unidad?.modelo ?? null,
      cliente: cliente?.nombre_completo ?? null,
      fecha_venta: v.fecha_venta,
      precio_venta: Number(v.precio_venta),
      costo_total: costoMoto + costoFibra,
      utilidad,
    }
  })
}

export async function getProspectosPorEtapa(): Promise<Record<string, number>> {
  const supabase = createServerClient()
  const { data, error } = await supabase.from('prospectos').select('etapa')
  if (error) throw new Error(error.message)
  const conteo: Record<string, number> = {}
  ;(data ?? []).forEach(p => { conteo[p.etapa] = (conteo[p.etapa] ?? 0) + 1 })
  return conteo
}

export async function getInventario() {
  const supabase = createServerClient()
  const { data, error } = await supabase.from('unidades').select('estado_logistico, estado_comercial')
  if (error) throw new Error(error.message)
  const disponibles = (data ?? []).filter(u => !u.estado_comercial || u.estado_comercial === null)
  return {
    en_tienda: disponibles.filter(u => u.estado_logistico === 'En tienda').length,
    en_fibrero: disponibles.filter(u => u.estado_logistico === 'En fibrero').length,
    pedidas: disponibles.filter(u => u.estado_logistico === 'Pedida').length,
  }
}

export async function getCuentasPorCobrar(): Promise<CuentaCobrar[]> {
  const supabase = createServerClient()
  const { data: ventas, error } = await supabase
    .from('ventas')
    .select('id, precio_venta, estado_pago, clientes(nombre_completo), unidades(n_motor, modelo), pagos(monto)')
    .eq('tipo_venta', 'Separación')
    .neq('estado_pago', 'Pagado')
  if (error) throw new Error(error.message)

  return (ventas ?? []).map(v => {
    const cliente = v.clientes as { nombre_completo?: string } | null
    const unidad = v.unidades as { n_motor?: string; modelo?: string } | null
    const pagosArr = v.pagos as { monto: number | string }[] | null
    const pagado = (pagosArr ?? []).reduce((acc, p) => acc + Number(p.monto), 0)
    return {
      id: v.id,
      cliente: cliente?.nombre_completo ?? null,
      modelo: unidad?.modelo ?? null,
      n_motor: unidad?.n_motor ?? null,
      precio_venta: Number(v.precio_venta),
      pagado,
      saldo_pendiente: Number(v.precio_venta) - pagado,
    }
  })
}
