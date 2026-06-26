// components/unidades/sections/garantias-section.tsx
import { format, parse } from 'date-fns'
import { es } from 'date-fns/locale'

function parseLocalDate(dateStr: string) {
  return parse(dateStr, 'yyyy-MM-dd', new Date())
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function GarantiasSection({ unidad }: { unidad: any }) {
  const garantia = unidad.garantias

  if (!garantia) {
    return (
      <p className="text-sm text-muted-foreground">
        Las garantías se registran automáticamente al marcar la unidad como Entregada.
      </p>
    )
  }

  const inicioMoto = parseLocalDate(garantia.garantia_moto_inicio)
  const inicioFibra = parseLocalDate(garantia.garantia_fibra_inicio)
  const vencFibra = parseLocalDate(garantia.garantia_fibra_vencimiento)

  return (
    <div className="space-y-4 text-sm">
      <div className="border rounded-lg p-4 space-y-1">
        <p className="font-semibold">Garantía de moto</p>
        <p className="text-muted-foreground">{garantia.garantia_moto_km.toLocaleString('es-PE')} km</p>
        <p className="text-muted-foreground">Inicio: {format(inicioMoto, 'dd/MM/yyyy', { locale: es })}</p>
      </div>
      <div className="border rounded-lg p-4 space-y-1">
        <p className="font-semibold">Garantía de fibra</p>
        <p className="text-muted-foreground">Inicio: {format(inicioFibra, 'dd/MM/yyyy', { locale: es })}</p>
        <p className={`font-medium ${vencFibra < new Date() ? 'text-red-600' : 'text-green-600'}`}>
          Vencimiento: {format(vencFibra, 'dd/MM/yyyy', { locale: es })}
          {vencFibra < new Date() ? ' (vencida)' : ''}
        </p>
      </div>
    </div>
  )
}
