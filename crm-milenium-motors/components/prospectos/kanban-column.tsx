// components/prospectos/kanban-column.tsx
import { ProspectoCard } from './prospecto-card'

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
  color: string
}

export function KanbanColumn({ etapa, prospectos, color }: Props) {
  return (
    <div className="flex-1 min-w-56 max-w-72">
      <div className={`text-xs font-semibold px-2 py-1 rounded-t ${color} flex items-center justify-between`}>
        <span>{etapa}</span>
        <span className="bg-white/50 rounded-full px-1.5">{prospectos.length}</span>
      </div>
      <div className="bg-gray-50 rounded-b-lg p-2 space-y-2 min-h-32">
        {prospectos.length === 0 && (
          <p className="text-xs text-gray-400 text-center pt-4">Sin prospectos</p>
        )}
        {prospectos.map(p => (
          <ProspectoCard key={p.id} prospecto={p} />
        ))}
      </div>
    </div>
  )
}
