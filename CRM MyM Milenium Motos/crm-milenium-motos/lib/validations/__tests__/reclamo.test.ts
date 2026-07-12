// lib/validations/__tests__/reclamo.test.ts
import { describe, it, expect } from 'vitest'
import { reclamoSchema } from '../reclamo'

describe('reclamoSchema', () => {
  const valido = {
    tipo: 'Moto' as const,
    fecha_reclamo: '2026-01-15',
    descripcion: 'Ruido en el motor',
    estado: 'Pendiente' as const,
    taller: 'Taller Central',
    precio: 150,
  }

  it('acepta datos válidos', () => {
    expect(() => reclamoSchema.parse(valido)).not.toThrow()
  })
  it('rechaza tipo fuera del enum', () => {
    expect(() => reclamoSchema.parse({ ...valido, tipo: 'Otro' })).toThrow()
  })
  it('rechaza fecha_reclamo vacía', () => {
    expect(() => reclamoSchema.parse({ ...valido, fecha_reclamo: '' })).toThrow()
  })
  it('rechaza estado fuera del enum', () => {
    expect(() => reclamoSchema.parse({ ...valido, estado: 'En proceso' })).toThrow()
  })
  it('rechaza precio negativo', () => {
    expect(() => reclamoSchema.parse({ ...valido, precio: -5 })).toThrow()
  })
  it('acepta precio nulo (opcional)', () => {
    expect(() => reclamoSchema.parse({ ...valido, precio: null })).not.toThrow()
  })
  it('acepta descripcion y taller ausentes (opcionales)', () => {
    expect(() => reclamoSchema.parse({ tipo: 'Fibra', fecha_reclamo: '2026-01-15', estado: 'Resuelto' })).not.toThrow()
  })
})
