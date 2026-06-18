// app/(vendedor)/unidades/page.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { obtenerUnidades } from '@/lib/actions/unidades'
import { UnidadFilters } from '@/components/unidades/unidad-filters'
import { BadgeLogistico, BadgeComercial } from '@/components/unidades/estado-badges'
import { Button } from '@/components/ui/button'

interface Props {
  searchParams: { modelo?: string; estado_logistico?: string; estado_comercial?: string; tipo_ingreso?: string }
}

export default async function UnidadesPage({ searchParams }: Props) {
  const unidades = await obtenerUnidades(searchParams)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Unidades</h1>
        <Button asChild><Link href="/unidades/nueva">+ Nueva unidad</Link></Button>
      </div>
      <Suspense fallback={<div className="flex flex-wrap gap-2 h-9" />}>
        <UnidadFilters />
      </Suspense>
      <div className="bg-white rounded-lg border divide-y">
        {unidades.length === 0 && (
          <p className="p-6 text-gray-500 text-center">No se encontraron unidades</p>
        )}
        {unidades.map(u => (
          <Link
            key={u.id}
            href={`/unidades/${u.id}`}
            className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-mono font-medium text-sm truncate">{u.n_motor}</p>
              <p className="text-sm text-gray-500">{u.modelo} · {u.tipo_ingreso}</p>
              {u.clientes && (
                <p className="text-xs text-gray-400">{u.clientes.nombre_completo}</p>
              )}
            </div>
            <div className="flex flex-col gap-1 items-end">
              <BadgeLogistico estado={u.estado_logistico} />
              <BadgeComercial estado={u.estado_comercial} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
