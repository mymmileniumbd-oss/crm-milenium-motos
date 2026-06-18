// app/(vendedor)/clientes/page.tsx
import Link from 'next/link'
import { obtenerClientes } from '@/lib/actions/clientes'
import { Button } from '@/components/ui/button'

export default async function ClientesPage() {
  const clientes = await obtenerClientes()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button asChild><Link href="/clientes/nuevo">+ Nuevo cliente</Link></Button>
      </div>
      <div className="bg-white rounded-lg border divide-y">
        {clientes.length === 0 && (
          <p className="p-6 text-gray-500 text-center">No hay clientes registrados</p>
        )}
        {clientes.map(c => (
          <Link key={c.id} href={`/clientes/${c.id}`}
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-medium">{c.nombre_completo}</p>
              <p className="text-sm text-gray-500">DNI: {c.dni} · {c.telefono}</p>
            </div>
            <span className="text-gray-400">›</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
