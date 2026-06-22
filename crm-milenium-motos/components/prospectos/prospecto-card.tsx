// components/prospectos/prospecto-card.tsx
'use client'

import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { actualizarEtapaProspecto } from '@/lib/actions/prospectos'
import { ETAPAS_PROSPECTO } from '@/lib/constants'
import { Phone } from 'lucide-react'

interface Prospecto {
  id: string
  nombre: string
  telefono: string | null
  modelo_interes: string | null
  etapa: string
  origen?: string | null
  fecha_contacto?: string | null
}

export function ProspectoCard({ prospecto, showEtapaSelector = false }: { prospecto: Prospecto; showEtapaSelector?: boolean }) {
  async function handleEtapaChange(etapa: string) {
    await actualizarEtapaProspecto(prospecto.id, etapa)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm space-y-2">
      <Link href={`/prospectos/${prospecto.id}`} className="block">
        <p className="font-medium text-sm hover:underline">{prospecto.nombre}</p>
        {prospecto.modelo_interes && (
          <p className="text-xs text-muted-foreground">{prospecto.modelo_interes}</p>
        )}
        {prospecto.telefono && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <Phone size={10} /> {prospecto.telefono}
          </p>
        )}
        {prospecto.origen && (
          <p className="text-xs text-muted-foreground mt-0.5">{prospecto.origen}</p>
        )}
        {prospecto.fecha_contacto && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(prospecto.fecha_contacto).toLocaleDateString('es-PE')}
          </p>
        )}
      </Link>
      {showEtapaSelector && (
        <Select value={prospecto.etapa} onValueChange={handleEtapaChange}>
          <SelectTrigger className="h-7 text-xs w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ETAPAS_PROSPECTO.map(e => (
              <SelectItem key={e} value={e}>{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
