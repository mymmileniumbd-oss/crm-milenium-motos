import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns'

export type Periodo = 'dia' | 'semana' | 'mes'

export function calcularRangoPeriodo(
  periodo: Periodo,
  mes?: number,
  anio?: number,
): { desde: string; hasta: string } {
  const hoy = new Date()
  let desde: Date
  let hasta: Date

  switch (periodo) {
    case 'dia':
      desde = startOfDay(hoy)
      hasta = endOfDay(hoy)
      break
    case 'semana':
      desde = startOfWeek(hoy, { weekStartsOn: 1 })
      hasta = endOfWeek(hoy, { weekStartsOn: 1 })
      break
    case 'mes': {
      const base = mes !== undefined && anio !== undefined
        ? new Date(anio, mes - 1, 1)
        : hoy
      desde = startOfMonth(base)
      hasta = endOfMonth(base)
      break
    }
  }

  return {
    desde: format(desde, 'yyyy-MM-dd'),
    hasta: format(hasta, 'yyyy-MM-dd'),
  }
}
