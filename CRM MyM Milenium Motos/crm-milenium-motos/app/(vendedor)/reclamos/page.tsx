// app/(vendedor)/reclamos/page.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { obtenerReclamos } from '@/lib/actions/reclamos'
import { TramitesFiltro } from '@/components/tramites/tramites-filtro'
import { PageHeader } from '@/components/ui/page-header'
import { EstadoBadge } from '@/components/unidades/estado-badges'
import { formatSoles } from '@/lib/utils/format'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export default async function ReclamosPage({
  searchParams,
}: {
  searchParams: { mes?: string; anio?: string }
}) {
  const ahora = new Date()
  const mes = Number(searchParams.mes ?? ahora.getMonth() + 1)
  const anio = Number(searchParams.anio ?? ahora.getFullYear())
  const prefijo = `${anio}-${String(mes).padStart(2, '0')}`

  const todos = await obtenerReclamos()
  const reclamos = todos.filter(r => r.fecha_reclamo?.startsWith(prefijo))

  return (
    <div className="space-y-4">
      <PageHeader
        title="Reclamos"
        description={
          <>
            Mostrando reclamos de{' '}
            <span className="font-bold text-foreground">{MESES[mes - 1]} {anio}</span>
            {' · '}{reclamos.length} resultado{reclamos.length !== 1 ? 's' : ''}
          </>
        }
        actions={
          <Suspense>
            <TramitesFiltro />
          </Suspense>
        }
      />
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {reclamos.length === 0 ? (
          <p className="p-6 text-muted-foreground text-center">No hay reclamos para este mes</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fecha reclamo</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fecha resolución</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Unidad</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Descripción</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Taller</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Costo</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reclamos.map((r) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const unidad = Array.isArray(r.unidades) ? (r.unidades as any[])[0] : r.unidades

                return (
                  <tr key={r.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[13px] text-foreground whitespace-nowrap">{r.fecha_reclamo}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-[13px]">
                      {r.fecha_resolucion
                        ? <span className="text-[#157a4d]">{r.fecha_resolucion}</span>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {unidad ? (
                        <Link href={`/unidades/${unidad.id}`} className="hover:underline font-medium">
                          {unidad.modelo}{' '}
                          <span className="font-mono text-muted-foreground">{unidad.n_motor}</span>
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-md px-2 py-1 text-xs font-bold"
                        style={
                          r.tipo === 'Moto'
                            ? { backgroundColor: '#eaf0fe', color: '#1c52c4' }
                            : { backgroundColor: '#fdeede', color: '#b5560f' }
                        }
                      >
                        {r.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground max-w-xs truncate">
                      {r.descripcion ?? <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {r.taller ?? <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground tabular-nums">
                      {r.precio != null ? formatSoles(Number(r.precio)) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge
                        tone={
                          r.estado === 'Resuelto'
                            ? 'green'
                            : r.estado === 'En proceso'
                            ? 'amber'
                            : 'red'
                        }
                      >
                        {r.estado}
                      </EstadoBadge>
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
