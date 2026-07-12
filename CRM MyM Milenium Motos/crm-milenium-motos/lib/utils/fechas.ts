// lib/utils/fechas.ts
import { addMonths, differenceInDays, format } from 'date-fns'

export function calcularGarantiaFibraVencimiento(fechaInicio: Date): Date {
  return addMonths(fechaInicio, 1)
}

export function calcularGarantiaFibraVencimientoStr(fechaInicioStr: string): string {
  const fecha = new Date(fechaInicioStr)
  return format(addMonths(fecha, 1), 'yyyy-MM-dd')
}

export function esSeguimientoPendiente(fechaVenta: Date, seguimientoHecho: boolean): boolean {
  return differenceInDays(new Date(), fechaVenta) >= 7 && !seguimientoHecho
}

export function calcularDiasTranscurridos(fechaVenta: Date): number {
  return differenceInDays(new Date(), fechaVenta)
}
