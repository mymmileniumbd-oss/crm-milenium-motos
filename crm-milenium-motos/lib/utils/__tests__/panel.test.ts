import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { calcularRangoPeriodo } from '../panel'

describe('calcularRangoPeriodo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // 2026-06-30 es martes (Jun 1 es lunes → Jun 29 es lunes → Jun 30 es martes)
    vi.setSystemTime(new Date('2026-06-30T12:00:00Z'))
  })
  afterEach(() => { vi.useRealTimers() })

  it('dia: retorna hoy como desde y hasta', () => {
    const { desde, hasta } = calcularRangoPeriodo('dia')
    expect(desde).toBe('2026-06-30')
    expect(hasta).toBe('2026-06-30')
  })

  it('semana: retorna lunes a domingo de la semana en curso', () => {
    const { desde, hasta } = calcularRangoPeriodo('semana')
    expect(desde).toBe('2026-06-29') // lunes
    expect(hasta).toBe('2026-07-05') // domingo
  })

  it('mes: retorna primer y último día del mes en curso', () => {
    const { desde, hasta } = calcularRangoPeriodo('mes')
    expect(desde).toBe('2026-06-01')
    expect(hasta).toBe('2026-06-30')
  })

  it('dia a fin de mes: desde y hasta son el último día del mes', () => {
    vi.setSystemTime(new Date('2026-05-31T10:00:00Z'))
    const { desde, hasta } = calcularRangoPeriodo('dia')
    expect(desde).toBe('2026-05-31')
    expect(hasta).toBe('2026-05-31')
  })
})
