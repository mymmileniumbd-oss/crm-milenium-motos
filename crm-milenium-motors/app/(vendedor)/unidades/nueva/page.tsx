// app/(vendedor)/unidades/nueva/page.tsx
'use client'

import { UnidadForm } from '@/components/unidades/unidad-form'
import { crearUnidad } from '@/lib/actions/unidades'

export default function NuevaUnidadPage() {
  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-bold">Nueva unidad</h1>
      <div className="bg-white rounded-lg border p-6">
        <UnidadForm onSubmit={crearUnidad} />
      </div>
    </div>
  )
}
