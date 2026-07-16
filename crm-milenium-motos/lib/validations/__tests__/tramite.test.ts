// lib/validations/__tests__/tramite.test.ts
import { describe, it, expect } from 'vitest'
import { tramiteSchema } from '../tramite'

describe('tramiteSchema', () => {
  const valido = {
    sunarp_estado: 'Ingreso' as const,
    sunarp_fecha: '2026-01-15',
    aap_estado: 'Pago' as const,
    aap_fecha: '2026-01-16',
  }

  it('acepta datos válidos', () => {
    expect(() => tramiteSchema.parse(valido)).not.toThrow()
  })
  it('acepta todos los campos ausentes (todos opcionales)', () => {
    expect(() => tramiteSchema.parse({})).not.toThrow()
  })
  it('acepta campos nulos', () => {
    expect(() => tramiteSchema.parse({
      sunarp_estado: null,
      sunarp_fecha: null,
      aap_estado: null,
      aap_fecha: null,
    })).not.toThrow()
  })
  it('rechaza sunarp_estado fuera del enum', () => {
    expect(() => tramiteSchema.parse({ ...valido, sunarp_estado: 'Rechazado' })).toThrow()
  })
  it('rechaza aap_estado fuera del enum', () => {
    expect(() => tramiteSchema.parse({ ...valido, aap_estado: 'Cancelado' })).toThrow()
  })
})
