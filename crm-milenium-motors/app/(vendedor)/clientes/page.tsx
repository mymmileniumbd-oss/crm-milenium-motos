// app/(vendedor)/clientes/page.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { obtenerClientes } from '@/lib/actions/clientes'
import { ClientesBusqueda } from '@/components/clientes/clientes-busqueda'
import { Button } from '@/components/ui/button'

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const todos = await obtenerClientes()
  const q = searchParams.q?.toLowerCase().trim() ?? ''
  const clientes = q
    ? todos.filter(c =>
        c.nombre_completo.toLowerCase().includes(q) ||
        c.dni.includes(q)
      )
    : todos

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <div className="flex items-center gap-3">
          <Suspense>
            <ClientesBusqueda />
          </Suspense>
          <Button asChild><Link href="/clientes/nuevo">+ Nuevo cliente</Link></Button>
        </div>
      </div>
      <div className="bg-white rounded-lg border divide-y">
        {clientes.length === 0 && (
          <p className="p-6 text-gray-500 text-center">
            {q ? `No se encontraron clientes para "${q}"` : 'No hay clientes registrados'}
          </p>
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
