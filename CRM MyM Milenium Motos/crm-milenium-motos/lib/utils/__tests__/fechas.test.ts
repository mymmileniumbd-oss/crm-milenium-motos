// lib/utils/__tests__/fechas.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  calcularGarantiaFibraVencimiento,
  calcularGarantiaFibraVencimientoStr,
  esSeguimientoPendiente,
  calcularDiasTranscurridos,
} from '../fechas'

describe('calcularGarantiaFibraVencimiento', () => {
  it('agrega 1 mes a fecha normal', () => {
    const inicio = new Date('2026-01-15')
    const resultado = calcularGarantiaFibraVencimiento(inicio)
    expect(resultado.toISOString().startsWith('2026-02-15')).toBe(true)
  })
  it('maneja fin de mes correctamente (ene 31 → feb 28)', () => {
    const inicio = new Date('2026-01-31')
    const resultado = calcularGarantiaFibraVencimiento(inicio)
    expect(resultado.toISOString().startsWith('2026-02-28')).toBe(true)
  })
  it('maneja cambio de año (dic → ene)', () => {
    const inicio = new Date('2025-12-10')
    const resultado = calcularGarantiaFibraVencimiento(inicio)
    expect(resultado.toISOString().startsWith('2026-01-10')).toBe(true)
  })
})

describe('calcularGarantiaFibraVencimientoStr', () => {
  it('agrega 1 mes a un string yyyy-MM-dd normal', () => {
    expect(calcularGarantiaFibraVencimientoStr('2026-01-15')).toBe('2026-02-15')
  })
  it('maneja fin de mes correctamente (ene 31 → feb 28)', () => {
    expect(calcularGarantiaFibraVencimientoStr('2026-01-31')).toBe('2026-02-28')
  })
  it('maneja cambio de año (dic → ene)', () => {
    expect(calcularGarantiaFibraVencimientoStr('2025-12-10')).toBe('2026-01-10')
  })
})

describe('esSeguimientoPendiente', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-18'))
  })
  afterEach(() => { vi.useRealTimers() })

  it('retorna true cuando fechaVenta fue hace exactamente 7 días y seguimiento no hecho', () => {
    expect(esSeguimientoPendiente(new Date('2026-06-11'), false)).toBe(true)
  })
  it('retorna true cuando fechaVenta fue hace más de 7 días y seguimiento no hecho', () => {
    expect(esSeguimientoPendiente(new Date('2026-06-01'), false)).toBe(true)
  })
  it('retorna false cuando fechaVenta fue hace menos de 7 días', () => {
    expect(esSeguimientoPendiente(new Date('2026-06-15'), false)).toBe(false)
  })
  it('retorna false cuando fechaVenta es hoy', () => {
    expect(esSeguimientoPendiente(new Date('2026-06-18'), false)).toBe(false)
  })
  it('retorna false cuando fechaVenta fue hace 8 días pero seguimiento ya hecho', () => {
    expect(esSeguimientoPendiente(new Date('2026-06-10'), true)).toBe(false)
  })
  it('retorna true cuando fechaVenta fue hace 8 días y seguimiento no hecho', () => {
    expect(esSeguimientoPendiente(new Date('2026-06-10'), false)).toBe(true)
  })
})

describe('calcularDiasTranscurridos', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-18'))
  })
  afterEach(() => { vi.useRealTimers() })

  it('retorna 7 para fecha de hace 7 días', () => {
    expect(calcularDiasTranscurridos(new Date('2026-06-11'))).toBe(7)
  })
})
