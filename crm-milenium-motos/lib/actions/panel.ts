// lib/actions/panel.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { parse, differenceInDays } from 'date-fns'
import { calcularRangoPeriodo, type Periodo } from '@/lib/utils/panel'
import { MODELOS_MOTO } from '@/lib/constants'

// ─── Tipos exportados ────────────────────────────────────────────────────────

export interface AlertaSeguimiento {
  venta_id: string
  unidad_id: string
  modelo: string
  n_motor: string
  cliente: string | null
  dias_desde_entrega: number
}

export interface AlertaLead {
  id: string
  nombre: string
  telefono: string | null
  etapa: string
  dias_sin_contactar: number
}

export interface EmbudoData {
  leadsRecibidos: number
  dieronAdelanto: number
  ventasCerradas: number
  tasaConversion: number | null
}

export interface CarteraSeparada {
  unidad_id: string
  modelo: string
  n_motor: string
  cliente: string | null
  precio_venta: number
  pagado: number
  saldo: number
  dias_desde_venta: number | null
}

export interface CarteraPendienteEntrega {
  unidad_id: string
  modelo: string
  n_motor: string
  cliente: string | null
  fecha_venta: string | null
}

export interface CarteraTramitePendiente {
  unidad_id: string
  modelo: string
  n_motor: string
  cliente: string | null
  sunarp_estado: string | null
  aap_estado: string | null
}

// ─── Alertas ─────────────────────────────────────────────────────────────────

export async function getAlertasSeguimiento(): Promise<AlertaSeguimiento[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('ventas')
    .select(`
      id,
      unidad_id,
      clientes(nombre_completo),
      unidades(id, modelo, n_motor, fecha_entrega)
    `)
    .eq('seguimiento_7dias_hecho', false)

  if (error) throw new Error(error.message)

  const hoy = new Date()

  return (data ?? [])
    .filter(v => {
      const u = v.unidades as unknown as { fecha_entrega?: string | null } | null
      if (!u?.fecha_entrega) return false
      const fechaEntrega = parse(u.fecha_entrega, 'yyyy-MM-dd', new Date())
      return differenceInDays(hoy, fechaEntrega) >= 7
    })
    .map(v => {
      const u = v.unidades as unknown as { id: string; modelo: string; n_motor: string; fecha_entrega: string }
      const c = v.clientes as unknown as { nombre_completo: string } | null
      const fechaEntrega = parse(u.fecha_entrega, 'yyyy-MM-dd', new Date())
      return {
        venta_id: v.id,
        unidad_id: v.unidad_id,
        modelo: u.modelo,
        n_motor: u.n_motor,
        cliente: c?.nombre_completo ?? null,
        dias_desde_entrega: differenceInDays(hoy, fechaEntrega),
      }
    })
    .sort((a, b) => b.dias_desde_entrega - a.dias_desde_entrega)
}

export async function getAlertasLeadsSinContactar(dias: number): Promise<AlertaLead[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('prospectos')
    .select('id, nombre, telefono, etapa, updated_at')
    .neq('etapa', 'Vendido')
    .neq('etapa', 'Desistió')

  if (error) throw new Error(error.message)

  const hoy = new Date()
  const limite = new Date(hoy.getTime() - dias * 24 * 60 * 60 * 1000)

  return (data ?? [])
    .filter(p => new Date(p.updated_at) <= limite)
    .map(p => ({
      id: p.id,
      nombre: p.nombre,
      telefono: p.telefono ?? null,
      etapa: p.etapa,
      dias_sin_contactar: differenceInDays(hoy, new Date(p.updated_at)),
    }))
    .sort((a, b) => b.dias_sin_contactar - a.dias_sin_contactar)
}

// ─── Embudo ───────────────────────────────────────────────────────────────────

export async function getEmbudoPeriodo(periodo: Periodo): Promise<EmbudoData> {
  const supabase = createServerClient()
  const { desde, hasta } = calcularRangoPeriodo(periodo)
  const hastaFin = hasta + 'T23:59:59'

  const [leadsRes, adelantosRes, ventasRes] = await Promise.all([
    supabase
      .from('prospectos')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', desde)
      .lte('created_at', hastaFin),
    supabase
      .from('ventas')
      .select('id', { count: 'exact', head: true })
      .eq('tipo_venta', 'Separación')
      .gte('fecha_venta', desde)
      .lte('fecha_venta', hasta),
    supabase
      .from('ventas')
      .select('id', { count: 'exact', head: true })
      .gte('fecha_venta', desde)
      .lte('fecha_venta', hasta),
  ])

  const leadsRecibidos = leadsRes.count ?? 0
  const dieronAdelanto = adelantosRes.count ?? 0
  const ventasCerradas = ventasRes.count ?? 0

  return {
    leadsRecibidos,
    dieronAdelanto,
    ventasCerradas,
    tasaConversion: leadsRecibidos > 0 ? Math.round((ventasCerradas / leadsRecibidos) * 100) : null,
  }
}

// ─── Cartera ──────────────────────────────────────────────────────────────────

export async function getCarteraSeparadas(): Promise<CarteraSeparada[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('unidades')
    .select(`
      id, modelo, n_motor,
      clientes(nombre_completo),
      ventas(id, precio_venta, fecha_venta, pagos(monto))
    `)
    .eq('estado_comercial', 'Separada')

  if (error) throw new Error(error.message)

  const hoy = new Date()

  return (data ?? []).map(u => {
    const ventasArr = u.ventas as { precio_venta: number; fecha_venta: string | null; pagos: { monto: number }[] }[] | null
    const venta = ventasArr?.[0]
    const pagosArr = (venta?.pagos ?? []) as { monto: number | string }[]
    const pagado = pagosArr.reduce((acc, p) => acc + Number(p.monto), 0)
    const precioVenta = Number(venta?.precio_venta ?? 0)
    const fechaVenta = venta?.fecha_venta
      ? parse(venta.fecha_venta, 'yyyy-MM-dd', new Date())
      : null

    return {
      unidad_id: u.id,
      modelo: u.modelo,
      n_motor: u.n_motor,
      cliente: (u.clientes as unknown as { nombre_completo: string } | null)?.nombre_completo ?? null,
      precio_venta: precioVenta,
      pagado,
      saldo: precioVenta - pagado,
      dias_desde_venta: fechaVenta ? differenceInDays(hoy, fechaVenta) : null,
    }
  })
}

export async function getCarteraPendientesEntrega(): Promise<CarteraPendienteEntrega[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('unidades')
    .select(`
      id, modelo, n_motor,
      clientes(nombre_completo),
      ventas(fecha_venta)
    `)
    .eq('estado_comercial', 'Vendida')

  if (error) throw new Error(error.message)

  return (data ?? []).map(u => {
    const ventasArr = u.ventas as { fecha_venta: string | null }[] | null
    return {
      unidad_id: u.id,
      modelo: u.modelo,
      n_motor: u.n_motor,
      cliente: (u.clientes as unknown as { nombre_completo: string } | null)?.nombre_completo ?? null,
      fecha_venta: ventasArr?.[0]?.fecha_venta ?? null,
    }
  })
}

export async function getCarteraTramitesPendientes(): Promise<CarteraTramitePendiente[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('unidades')
    .select(`
      id, modelo, n_motor,
      clientes(nombre_completo),
      tramites(sunarp_estado, aap_estado)
    `)
    .eq('estado_comercial', 'Entregada')

  if (error) throw new Error(error.message)

  return (data ?? [])
    .filter(u => {
      const t = (u.tramites as { sunarp_estado: string | null; aap_estado: string | null }[] | null)?.[0]
      if (!t) return true
      return t.sunarp_estado !== 'Inscrito' || t.aap_estado !== 'Recojo'
    })
    .map(u => {
      const t = (u.tramites as { sunarp_estado: string | null; aap_estado: string | null }[] | null)?.[0]
      return {
        unidad_id: u.id,
        modelo: u.modelo,
        n_motor: u.n_motor,
        cliente: (u.clientes as unknown as { nombre_completo: string } | null)?.nombre_completo ?? null,
        sunarp_estado: t?.sunarp_estado ?? null,
        aap_estado: t?.aap_estado ?? null,
      }
    })
}

// ─── Inventario ───────────────────────────────────────────────────────────────

export async function getInventarioDisponible(): Promise<Record<string, number>> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('unidades')
    .select('modelo')
    .is('estado_comercial', null)
    .eq('estado_logistico', 'En tienda')

  if (error) throw new Error(error.message)

  const conteo: Record<string, number> = {}
  MODELOS_MOTO.forEach(m => { conteo[m] = 0 })
  ;(data ?? []).forEach(u => { conteo[u.modelo] = (conteo[u.modelo] ?? 0) + 1 })

  return conteo
}

export async function getInventarioEnCamino(): Promise<Record<string, { pedidas: number; en_fibrero: number }>> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('unidades')
    .select('modelo, estado_logistico')
    .in('estado_logistico', ['Pedida', 'En fibrero'])

  if (error) throw new Error(error.message)

  const conteo: Record<string, { pedidas: number; en_fibrero: number }> = {}

  ;(data ?? []).forEach(u => {
    if (!conteo[u.modelo]) conteo[u.modelo] = { pedidas: 0, en_fibrero: 0 }
    if (u.estado_logistico === 'Pedida') conteo[u.modelo].pedidas++
    else conteo[u.modelo].en_fibrero++
  })

  return conteo
}
