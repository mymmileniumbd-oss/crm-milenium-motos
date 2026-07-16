// lib/validations/__tests__/prospecto.test.ts
import { describe, it, expect } from 'vitest'
import { prospectoSchema } from '../prospecto'

describe('prospectoSchema', () => {
  const valido = {
    nombre: 'Ana Torres',
    telefono: '999888777',
    modelo_interes: 'Deluxe GS' as const,
    origen: 'Facebook' as const,
    etapa: 'Interesado' as const,
    notas: 'Contactar por la tarde',
    vendedor_id: '11111111-1111-4111-8111-111111111111',
  }

  it('acepta datos válidos', () => {
    expect(() => prospectoSchema.parse(valido)).not.toThrow()
  })
  it('rechaza nombre vacío', () => {
    expect(() => prospectoSchema.parse({ ...valido, nombre: '' })).toThrow()
  })
  it('acepta modelo_interes nulo (opcional)', () => {
    expect(() => prospectoSchema.parse({ ...valido, modelo_interes: null })).not.toThrow()
  })
  it('rechaza modelo_interes fuera del enum', () => {
    expect(() => prospectoSchema.parse({ ...valido, modelo_interes: 'Modelo Inexistente' })).toThrow()
  })
  it('rechaza etapa fuera del enum', () => {
    expect(() => prospectoSchema.parse({ ...valido, etapa: 'Etapa Inexistente' })).toThrow()
  })
  it('rechaza vendedor_id que no es UUID', () => {
    expect(() => prospectoSchema.parse({ ...valido, vendedor_id: 'no-es-uuid' })).toThrow()
  })
  it('acepta campos opcionales ausentes', () => {
    expect(() => prospectoSchema.parse({ nombre: 'Ana Torres', etapa: 'Interesado' })).not.toThrow()
  })
})
