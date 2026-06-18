// components/unidades/unidad-filters.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MODELOS_MOTO, ESTADOS_LOGISTICO } from '@/lib/constants'

export function UnidadFilters() {
  const router = useRouter()
  const params = useSearchParams()

  function setFilter(key: string, value: string) {
    const sp = new URLSearchParams(params.toString())
    if (value === 'todos') sp.delete(key)
    else sp.set(key, value)
    router.push(`/unidades?${sp.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Select value={params.get('modelo') ?? 'todos'} onValueChange={v => setFilter('modelo', v)}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Modelo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los modelos</SelectItem>
          {MODELOS_MOTO.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={params.get('estado_logistico') ?? 'todos'} onValueChange={v => setFilter('estado_logistico', v)}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Logístico" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          {ESTADOS_LOGISTICO.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={params.get('estado_comercial') ?? 'todos'} onValueChange={v => setFilter('estado_comercial', v)}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Comercial" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          {['Disponible', 'Separada', 'Vendida', 'Entregada'].map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={params.get('tipo_ingreso') ?? 'todos'} onValueChange={v => setFilter('tipo_ingreso', v)}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Tipo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          <SelectItem value="Stock">Stock</SelectItem>
          <SelectItem value="Bajo pedido">Bajo pedido</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
