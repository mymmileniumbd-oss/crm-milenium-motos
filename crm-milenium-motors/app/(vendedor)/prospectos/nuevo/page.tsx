// app/(vendedor)/prospectos/nuevo/page.tsx
'use client'

import { ProspectoForm } from '@/components/prospectos/prospecto-form'
import { crearProspecto } from '@/lib/actions/prospectos'

export default function NuevoProspectoPage() {
  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-bold">Nuevo prospecto</h1>
      <div className="bg-white rounded-lg border p-6">
        <ProspectoForm onSubmit={crearProspecto} submitLabel="Registrar prospecto" />
      </div>
    </div>
  )
}
