// app/(vendedor)/prospectos/page.tsx
import Link from 'next/link'
import { obtenerProspectos } from '@/lib/actions/prospectos'
import { KanbanBoard } from '@/components/prospectos/kanban-board'
import { Button } from '@/components/ui/button'

export default async function ProspectosPage() {
  const prospectos = await obtenerProspectos()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Prospectos</h1>
        <Button asChild>
          <Link href="/prospectos/nuevo">+ Nuevo</Link>
        </Button>
      </div>
      <KanbanBoard prospectos={prospectos ?? []} />
    </div>
  )
}
