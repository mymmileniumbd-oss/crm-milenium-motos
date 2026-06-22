// app/(vendedor)/clientes/nuevo/page.tsx
import { ClienteForm } from '@/components/clientes/cliente-form'
import { crearCliente } from '@/lib/actions/clientes'

export default function NuevoClientePage() {
  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-[21px] font-extrabold tracking-tight">Nuevo cliente</h1>
      <div className="rounded-xl border border-border bg-card p-6">
        <ClienteForm onSubmit={crearCliente} submitLabel="Registrar cliente" />
      </div>
    </div>
  )
}
