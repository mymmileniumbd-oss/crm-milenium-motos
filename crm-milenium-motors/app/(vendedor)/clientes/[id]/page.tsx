// app/(vendedor)/clientes/[id]/page.tsx
import { obtenerCliente, actualizarCliente } from '@/lib/actions/clientes'
import { ClienteForm } from '@/components/clientes/cliente-form'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export default async function ClientePage({ params }: { params: { id: string } }) {
  const cliente = await obtenerCliente(params.id)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{cliente.nombre_completo}</h1>
      <div className="bg-white rounded-lg border p-6">
        <h2 className="font-semibold mb-4">Datos del cliente</h2>
        <ClienteForm
          defaultValues={{
            nombre_completo: cliente.nombre_completo,
            dni: cliente.dni,
            direccion: cliente.direccion ?? '',
            telefono: cliente.telefono ?? '',
            correo: cliente.correo ?? '',
          }}
          onSubmit={(data) => actualizarCliente(params.id, data)}
          submitLabel="Actualizar"
        />
      </div>
      {cliente.unidades && cliente.unidades.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold mb-3">Unidades</h2>
          <div className="divide-y">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {cliente.unidades.map((u: any) => (
              <Link key={u.id} href={`/unidades/${u.id}`}
                className="flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded">
                <span className="font-mono text-sm">{u.n_motor}</span>
                <Badge>{u.modelo}</Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
