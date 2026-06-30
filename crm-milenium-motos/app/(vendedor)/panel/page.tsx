// app/(vendedor)/panel/page.tsx
import { Suspense } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { AlertasSection } from '@/components/panel/alertas-section'
import { EmbudoSection } from '@/components/panel/embudo-section'
import { CarteraSection } from '@/components/panel/cartera-section'
import { InventarioSection } from '@/components/panel/inventario-section'
import type { Periodo } from '@/lib/utils/panel'

function SectionSkeleton({ height = 'h-32' }: { height?: string }) {
  return <div className={`${height} animate-pulse rounded-lg bg-secondary`} />
}

export default async function PanelPage({
  searchParams,
}: {
  searchParams: { periodo?: string; mes?: string; anio?: string }
}) {
  const periodo = (['dia', 'semana', 'mes'].includes(searchParams.periodo ?? '')
    ? searchParams.periodo
    : 'dia') as Periodo

  const hoy = new Date()
  const mes  = Number(searchParams.mes)  || hoy.getMonth() + 1
  const anio = Number(searchParams.anio) || hoy.getFullYear()

  return (
    <div className="space-y-6">
      <PageHeader title="Panel" description="Vista operativa del día" />

      <Suspense fallback={<SectionSkeleton height="h-40" />}>
        <AlertasSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-36" />}>
        <EmbudoSection periodo={periodo} mes={mes} anio={anio} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-56" />}>
        <CarteraSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-44" />}>
        <InventarioSection />
      </Suspense>
    </div>
  )
}
