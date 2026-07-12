// app/(vendedor)/ventas/page.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { obtenerVentas } from '@/lib/actions/ventas'
import { BadgeEstadoPago } from '@/components/unidades/estado-badges'
import { TramitesFiltro } from '@/components/tramites/tramites-filtro'
import { PageHeader } from '@/components/ui/page-header'
import { formatSoles } from '@/lib/utils/format'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export default async function VentasPage({
  searchParams,
}: {
  searchParams: { mes?: string; anio?: string }
}) {
  const ahora = new Date()
  const mes = Number(searchParams.mes ?? ahora.getMonth() + 1)
  const anio = Number(searchParams.anio ?? ahora.getFullYear())
  const prefijo = `${anio}-${String(mes).padStart(2, '0')}`

  const todas = await obtenerVentas()
  const ventas = todas.filter(v => v.fecha_venta?.startsWith(prefijo))

  return (
    <div className="space-y-4">
      <PageHeader
        title="Ventas"
        description={
          <>
            Mostrando ventas de{' '}
            <span className="font-bold text-foreground">{MESES[mes - 1]} {anio}</span>
            {' · '}{ventas.length} resultado{ventas.length !== 1 ? 's' : ''}
          </>
        }
        actions={
          <Suspense>
            <TramitesFiltro />
          </Suspense>
        }
      />
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {ventas.length === 0 ? (
          <p className="p-6 text-muted-foreground text-center">No hay ventas para este mes</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fecha</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Unidad</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Precio</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado pago</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ventas.map(v => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const cliente = Array.isArray(v.clientes) ? (v.clientes as any[])[0] : v.clientes
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const unidad = Array.isArray(v.unidades) ? (v.unidades as any[])[0] : v.unidades
                return (
                  <tr key={v.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[13px] text-foreground">{v.fecha_venta}</td>
                    <td className="px-4 py-3">
                      {cliente ? (
                        <Link href={`/clientes/${cliente.id}`} className="font-medium hover:underline">
                          {cliente.nombre_completo}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {unidad ? (
                        <Link href={`/unidades/${unidad.id}`} className="hover:underline">
                          {unidad.modelo} <span className="font-mono text-muted-foreground">{unidad.n_motor}</span>
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums">
                      {formatSoles(Number(v.precio_venta))}
                    </td>
                    <td className="px-4 py-3">
                      <BadgeEstadoPago estado={v.estado_pago ?? 'Pendiente'} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
