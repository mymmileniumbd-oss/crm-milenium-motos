// lib/utils/__tests__/estados.test.ts
import { describe, it, expect } from 'vitest'
import { calcularEstadoPago } from '../estados'

describe('calcularEstadoPago', () => {
  it('retorna Pendiente cuando suma es 0', () => {
    expect(calcularEstadoPago(0, 5000)).toBe('Pendiente')
  })
  it('retorna Pendiente cuando suma es null/undefined (pasado como 0)', () => {
    expect(calcularEstadoPago(0, 5000)).toBe('Pendiente')
  })
  it('retorna Parcial cuando la suma es mayor a 0 y menor al precio', () => {
    expect(calcularEstadoPago(2000, 5000)).toBe('Parcial')
  })
  it('retorna Pagado cuando la suma iguala al precio', () => {
    expect(calcularEstadoPago(5000, 5000)).toBe('Pagado')
  })
  it('retorna Pagado cuando la suma supera al precio', () => {
    expect(calcularEstadoPago(5001, 5000)).toBe('Pagado')
  })
  it('retorna Pagado con decimales exactos', () => {
    expect(calcularEstadoPago(1234.56, 1234.56)).toBe('Pagado')
  })
})
