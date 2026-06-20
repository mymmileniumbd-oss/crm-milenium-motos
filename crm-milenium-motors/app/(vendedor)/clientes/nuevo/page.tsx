// app/(vendedor)/clientes/nuevo/page.tsx
import { ClienteForm } from '@/components/clientes/cliente-form'
import { crearCliente } from '@/lib/actions/clientes'

export default function NuevoClientePage() {
  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-bold">Nuevo cliente</h1>
      <div className="bg-white rounded-lg border p-6">
        <ClienteForm onSubmit={crearCliente} submitLabel="Registrar cliente" />
      </div>
    </div>
  )
}
