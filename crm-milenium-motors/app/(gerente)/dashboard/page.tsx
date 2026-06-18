// app/(gerente)/dashboard/page.tsx
import { Suspense } from 'react'
import {
  getDatosVentas,
  getDatosCompras,
  getUtilidadPorUnidad,
  getProspectosPorEtapa,
  getInventario,
  getCuentasPorCobrar,
} from '@/lib/actions/dashboard'
import { PeriodoFilter } from '@/components/dashboard/periodo-filter'
import { VentasChart } from '@/components/dashboard/ventas-chart'
import { ComprasChart } from '@/components/dashboard/compras-chart'
import { UtilidadSection } from '@/components/dashboard/utilidad-section'
import { EmbudoChart } from '@/components/dashboard/embudo-chart'
import { InventarioCards } from '@/components/dashboard/inventario-cards'
import { CuentasCobrarTable } from '@/components/dashboard/cuentas-cobrar-table'

interface Props {
  searchParams: { desde?: string; hasta?: string }
}

function getPeriodoPorDefecto() {
  const hoy = new Date()
  const desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    .toISOString()
    .split('T')[0]
  const hasta = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
    .toISOString()
    .split('T')[0]
  return { desde, hasta }
}

export default async function DashboardPage({ searchParams }: Props) {
  const defecto = getPeriodoPorDefecto()
  const periodo = {
    desde: searchParams.desde ?? defecto.desde,
    hasta: searchParams.hasta ?? defecto.hasta,
  }

  const [ventas, compras, utilidades, prospectos, inventario, cuentas] =
    await Promise.all([
      getDatosVentas(periodo),
      getDatosCompras(periodo),
      getUtilidadPorUnidad(periodo),
      getProspectosPorEtapa(),
      getInventario(),
      getCuentasPorCobrar(),
    ])

  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="h-16 bg-white border rounded-lg animate-pulse" />}>
        <PeriodoFilter />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VentasChart ventas={ventas ?? []} />
        <ComprasChart compras={compras ?? []} />
      </div>

      <UtilidadSection utilidades={utilidades} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmbudoChart prospectosPorEtapa={prospectos} />
        <InventarioCards inventario={inventario} />
      </div>

      <CuentasCobrarTable cuentas={cuentas} />
    </div>
  )
}
