// app/(vendedor)/prospectos/nuevo/page.tsx
import { ProspectoForm } from '@/components/prospectos/prospecto-form'
import { crearProspecto } from '@/lib/actions/prospectos'

export default function NuevoProspectoPage() {
  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-[21px] font-extrabold tracking-tight">Nuevo prospecto</h1>
      <div className="rounded-xl border border-border bg-card p-6">
        <ProspectoForm onSubmit={crearProspecto} submitLabel="Registrar prospecto" />
      </div>
    </div>
  )
}
