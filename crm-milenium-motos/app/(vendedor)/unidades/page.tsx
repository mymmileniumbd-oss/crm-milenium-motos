// app/(vendedor)/unidades/page.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { obtenerUnidades } from '@/lib/actions/unidades'
import { UnidadFilters } from '@/components/unidades/unidad-filters'
import { BadgeLogistico, BadgeComercial } from '@/components/unidades/estado-badges'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { EliminarUnidadButton } from '@/components/unidades/eliminar-unidad-button'
import { Plus, ChevronRight } from 'lucide-react'

interface Props {
  searchParams: { modelo?: string; estado_logistico?: string; estado_comercial?: string; tipo_ingreso?: string }
}

export default async function UnidadesPage({ searchParams }: Props) {
  const unidades = await obtenerUnidades(searchParams)

  return (
    <div className="space-y-4">
      <PageHeader
        title="Unidades"
        description={`${unidades.length} unidad${unidades.length !== 1 ? 'es' : ''} en inventario`}
        actions={
          <Button asChild>
            <Link href="/unidades/nueva"><Plus size={16} /> Nueva unidad</Link>
          </Button>
        }
      />
      <Suspense fallback={<div className="flex flex-wrap gap-2 h-9" />}>
        <UnidadFilters />
      </Suspense>
      <div className="rounded-xl border border-border bg-card divide-y">
        {unidades.length === 0 && (
          <p className="p-6 text-muted-foreground text-center">No se encontraron unidades</p>
        )}
        {unidades.map(u => (
          <div key={u.id} className="flex items-center gap-2 pr-2 hover:bg-secondary/50 transition-colors">
            <Link
              href={`/unidades/${u.id}`}
              className="flex items-center gap-3 p-4 flex-1 min-w-0"
            >
              <div className="flex-1 min-w-0">
                <p className="font-mono font-medium text-sm truncate">{u.n_motor}</p>
                <p className="text-sm text-muted-foreground">{u.modelo} · {u.tipo_ingreso}</p>
                {u.clientes && (
                  <p className="text-xs text-muted-foreground">{u.clientes.nombre_completo}</p>
                )}
              </div>
              <div className="flex flex-col gap-1 items-end">
                <BadgeLogistico estado={u.estado_logistico} />
                <BadgeComercial estado={u.estado_comercial} />
              </div>
              <ChevronRight size={17} className="text-muted-foreground/40 shrink-0" />
            </Link>
            <EliminarUnidadButton id={u.id} nMotor={u.n_motor} />
          </div>
        ))}
      </div>
    </div>
  )
}
