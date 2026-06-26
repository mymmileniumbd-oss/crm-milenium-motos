// app/(vendedor)/unidades/nueva/page.tsx
import { UnidadForm } from '@/components/unidades/unidad-form'
import { crearUnidad } from '@/lib/actions/unidades'

export default function NuevaUnidadPage() {
  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-[21px] font-extrabold tracking-tight">Nueva unidad</h1>
      <div className="rounded-xl border border-border bg-card p-6">
        <UnidadForm onSubmit={crearUnidad} />
      </div>
    </div>
  )
}
