// components/prospectos/kanban-board.tsx
import { KanbanColumn } from './kanban-column'
import { ProspectoCard } from './prospecto-card'
import { ETAPAS_PROSPECTO } from '@/lib/constants'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type EtapaTone = { bg: string; fg: string; dot: string }

const COLORES_ETAPA: Record<string, EtapaTone> = {
  'Interesado': { bg: '#eaf0fe', fg: '#1c52c4', dot: '#2c6bdc' },
  'Dio adelanto': { bg: '#fdeede', fg: '#b5560f', dot: '#e07f2f' },
  'Vendido': { bg: '#e3f5ec', fg: '#157a4d', dot: '#1faa6a' },
  'Desistió': { bg: '#f1f3f7', fg: '#5b6472', dot: '#8a93a3' },
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
                <p className="text-sm text-muted-foreground text-center py-4">
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
