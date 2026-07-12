// lib/validations/__tests__/garantia.test.ts
import { describe, it, expect } from 'vitest'
import { garantiaSchema } from '../garantia'

describe('garantiaSchema', () => {
  const valido = {
    garantia_moto_km: 1500,
    garantia_moto_inicio: '2026-01-15',
    garantia_fibra_inicio: '2026-01-15',
    garantia_fibra_vencimiento: '2026-02-15',
  }

  it('acepta datos válidos', () => {
    expect(() => garantiaSchema.parse(valido)).not.toThrow()
  })
  it('acepta todos los campos ausentes (todos opcionales)', () => {
    expect(() => garantiaSchema.parse({})).not.toThrow()
  })
  it('acepta campos nulos', () => {
    expect(() => garantiaSchema.parse({
      garantia_moto_km: null,
      garantia_moto_inicio: null,
      garantia_fibra_inicio: null,
      garantia_fibra_vencimiento: null,
    })).not.toThrow()
  })
  it('rechaza kilometraje negativo', () => {
    expect(() => garantiaSchema.parse({ ...valido, garantia_moto_km: -1 })).toThrow()
  })
  it('acepta kilometraje en cero', () => {
    expect(() => garantiaSchema.parse({ ...valido, garantia_moto_km: 0 })).not.toThrow()
  })
})
