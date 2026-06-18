// lib/utils/__tests__/format.test.ts
import { describe, it, expect } from 'vitest'
import { formatSoles } from '../format'

describe('formatSoles', () => {
  it('formatea entero sin decimales como S/ X,XXX.00', () => {
    expect(formatSoles(1000)).toBe('S/ 1,000.00')
  })
  it('formatea decimal con dos lugares', () => {
    expect(formatSoles(1234.56)).toBe('S/ 1,234.56')
  })
  it('formatea cero', () => {
    expect(formatSoles(0)).toBe('S/ 0.00')
  })
  it('formatea número grande con separador de miles', () => {
    expect(formatSoles(10000)).toBe('S/ 10,000.00')
  })
})
