// components/prospectos/kanban-column.tsx
import { ProspectoCard } from './prospecto-card'
import type { EtapaTone } from './kanban-board'

interface Prospecto {
  id: string
  nombre: string
  telefono: string | null
  modelo_interes: string | null
  etapa: string
  origen?: string | null
  fecha_contacto?: string | null
}

interface Props {
  etapa: string
  prospectos: Prospecto[]
  color: EtapaTone
}

export function KanbanColumn({ etapa, prospectos, color }: Props) {
  return (
    <div className="flex min-w-56 max-w-72 flex-1 flex-col gap-3">
      <div
        className="flex items-center justify-between rounded-[10px] px-3.5 py-2.5"
        style={{ backgroundColor: color.bg, color: color.fg }}
      >
        <span className="text-[13px] font-extrabold">{etapa}</span>
        <span className="rounded-full bg-card px-2 py-px text-xs font-extrabold">
          {prospectos.length}
        </span>
      </div>
      <div className="flex min-h-32 flex-col gap-3">
        {prospectos.length === 0 && (
          <p className="pt-2 text-center text-xs text-muted-foreground">Sin prospectos</p>
        )}
        {prospectos.map((p) => (
          <ProspectoCard key={p.id} prospecto={p} />
        ))}
      </div>
    </div>
  )
}
