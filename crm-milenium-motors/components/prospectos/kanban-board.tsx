// components/prospectos/kanban-board.tsx
import { KanbanColumn } from './kanban-column'
import { ProspectoCard } from './prospecto-card'
import { ETAPAS_PROSPECTO } from '@/lib/constants'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const COLORES_ETAPA: Record<string, string> = {
  'Interesado': 'bg-blue-100 text-blue-700',
  'Dio adelanto': 'bg-orange-100 text-orange-700',
  'Vendido': 'bg-green-100 text-green-700',
  'Desistió': 'bg-gray-100 text-gray-600',
}

interface Prospecto {
  id: string
  nombre: string
  telefono: string | null
  modelo_interes: string | null
  etapa: string
  origen?: string | null
  fecha_contacto?: string | null
}

export function KanbanBoard({ prospectos }: { prospectos: Prospecto[] }) {
  const porEtapa = Object.fromEntries(
    ETAPAS_PROSPECTO.map(e => [e, prospectos.filter(p => p.etapa === e)])
  )

  return (
    <>
      {/* Desktop: columnas side by side */}
      <div className="hidden md:flex gap-3 overflow-x-auto pb-4">
        {ETAPAS_PROSPECTO.map(etapa => (
          <KanbanColumn
            key={etapa}
            etapa={etapa}
            prospectos={porEtapa[etapa]}
            color={COLORES_ETAPA[etapa]}
          />
        ))}
      </div>

      {/* Mobile: tabs */}
      <div className="md:hidden">
        <Tabs defaultValue={ETAPAS_PROSPECTO[0]}>
          <TabsList className="w-full overflow-x-auto flex flex-wrap h-auto gap-1 justify-start p-1">
            {ETAPAS_PROSPECTO.map(e => (
              <TabsTrigger key={e} value={e} className="text-xs">
                {e} ({porEtapa[e].length})
              </TabsTrigger>
            ))}
          </TabsList>
          {ETAPAS_PROSPECTO.map(etapa => (
            <TabsContent key={etapa} value={etapa} className="space-y-2 mt-3">
              {porEtapa[etapa].length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Sin prospectos en esta etapa
                </p>
              )}
              {porEtapa[etapa].map(p => (
                <ProspectoCard key={p.id} prospecto={p} showEtapaSelector />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  )
}
