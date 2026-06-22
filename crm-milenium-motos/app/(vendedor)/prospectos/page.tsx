// app/(vendedor)/prospectos/page.tsx
import Link from 'next/link'
import { obtenerProspectos } from '@/lib/actions/prospectos'
import { KanbanBoard } from '@/components/prospectos/kanban-board'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { Plus } from 'lucide-react'

export default async function ProspectosPage() {
  const prospectos = await obtenerProspectos()

  return (
    <div className="space-y-4">
      <PageHeader
        title="Prospectos"
        description={`Pipeline de ventas · ${prospectos?.length ?? 0} prospecto${(prospectos?.length ?? 0) !== 1 ? 's' : ''}`}
        actions={
          <Button asChild>
            <Link href="/prospectos/nuevo"><Plus size={16} /> Nuevo prospecto</Link>
          </Button>
        }
      />
      <KanbanBoard prospectos={prospectos ?? []} />
    </div>
  )
}
