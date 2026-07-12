// app/(vendedor)/clientes/page.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { obtenerClientes } from '@/lib/actions/clientes'
import { ClientesBusqueda } from '@/components/clientes/clientes-busqueda'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { Plus, ChevronRight } from 'lucide-react'

const AVATAR_TONES = [
  { bg: '#eef3fe', fg: '#1846b3' },
  { bg: '#fdeede', fg: '#b5560f' },
  { bg: '#e3f5ec', fg: '#157a4d' },
  { bg: '#f1eafe', fg: '#6b3fb0' },
]

function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

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
      <PageHeader
        title="Clientes"
        description={`${todos.length} cliente${todos.length !== 1 ? 's' : ''} registrado${todos.length !== 1 ? 's' : ''}`}
        actions={
          <>
            <Suspense>
              <ClientesBusqueda />
            </Suspense>
            <Button asChild>
              <Link href="/clientes/nuevo"><Plus size={16} /> Nuevo cliente</Link>
            </Button>
          </>
        }
      />
      <div className="rounded-xl border border-border bg-card divide-y">
        {clientes.length === 0 && (
          <p className="p-6 text-muted-foreground text-center">
            {q ? `No se encontraron clientes para "${q}"` : 'No hay clientes registrados'}
          </p>
        )}
        {clientes.map((c, i) => {
          const tone = AVATAR_TONES[i % AVATAR_TONES.length]
          return (
            <Link key={c.id} href={`/clientes/${c.id}`}
              className="flex items-center gap-3.5 p-4 hover:bg-secondary/50 transition-colors">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{ backgroundColor: tone.bg, color: tone.fg }}
              >
                {iniciales(c.nombre_completo)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{c.nombre_completo}</p>
                <p className="font-mono text-[13px] text-muted-foreground">
                  DNI {c.dni} · {c.telefono}
                </p>
              </div>
              <ChevronRight size={18} className="shrink-0 text-muted-foreground/40" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
