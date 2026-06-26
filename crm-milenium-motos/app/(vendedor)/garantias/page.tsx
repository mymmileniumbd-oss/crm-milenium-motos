// app/(vendedor)/garantias/page.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { obtenerGarantias } from '@/lib/actions/garantias'
import { TramitesFiltro } from '@/components/tramites/tramites-filtro'
import { format, parse } from 'date-fns'
import { es } from 'date-fns/locale'

function parseLocalDate(str: string) {
  return parse(str, 'yyyy-MM-dd', new Date())
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export default async function GarantiasPage({
  searchParams,
}: {
  searchParams: { mes?: string; anio?: string }
}) {
  const ahora = new Date()
  const mes = Number(searchParams.mes ?? ahora.getMonth() + 1)
  const anio = Number(searchParams.anio ?? ahora.getFullYear())
  const prefijo = `${anio}-${String(mes).padStart(2, '0')}`

  const todas = await obtenerGarantias()
  const garantias = todas.filter(g =>
    (g.garantia_moto_inicio && g.garantia_moto_inicio.startsWith(prefijo)) ||
    (g.garantia_fibra_vencimiento && g.garantia_fibra_vencimiento.startsWith(prefijo))
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[21px] font-extrabold tracking-tight">Garantías</h1>
        <Suspense>
          <TramitesFiltro />
        </Suspense>
      </div>
      <p className="text-sm text-muted-foreground">
        Mostrando garantías de <span className="font-medium">{MESES[mes - 1]} {anio}</span>
        {' · '}{garantias.length} resultado{garantias.length !== 1 ? 's' : ''}
      </p>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {garantias.length === 0 ? (
          <p className="p-6 text-muted-foreground text-center">No hay garantías para este mes</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Unidad</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Garantía moto (km)</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Inicio moto</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Venc. fibra</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado fibra</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {garantias.map((g) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const unidad = Array.isArray(g.unidades) ? (g.unidades as any[])[0] : g.unidades
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const cliente = Array.isArray(unidad?.clientes) ? (unidad?.clientes as any[])[0] : unidad?.clientes
                const vencFibra = g.garantia_fibra_vencimiento ? parseLocalDate(g.garantia_fibra_vencimiento) : null
                const vencida = vencFibra ? vencFibra < new Date() : false

                return (
                  <tr key={g.id} className="hover:bg-secondary/50 transition-colors">
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
                    <td className="px-4 py-3 text-foreground">
                      {cliente?.nombre_completo ?? <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {g.garantia_moto_km != null
                        ? g.garantia_moto_km.toLocaleString('es-PE')
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {g.garantia_moto_inicio
                        ? format(parseLocalDate(g.garantia_moto_inicio), 'dd/MM/yyyy', { locale: es })
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {vencFibra ? (
                        <span className={vencida ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                          {format(vencFibra, 'dd/MM/yyyy', { locale: es })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {vencFibra ? (
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-medium ${
                            vencida ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {vencida ? 'Vencida' : 'Vigente'}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
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
