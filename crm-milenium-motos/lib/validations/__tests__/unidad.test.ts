// lib/validations/__tests__/unidad.test.ts
import { describe, it, expect } from 'vitest'
import { unidadBaseSchema, compraSchema, fibraSchema } from '../unidad'

describe('unidadBaseSchema', () => {
  const valido = {
    n_motor: 'MTR-001',
    n_chasis: 'CHS-001',
    modelo: 'Deluxe GS' as const,
    tipo_ingreso: 'Stock' as const,
    estado_logistico: 'En tienda' as const,
    color: 'Rojo' as const,
    dua_item: 'DUA-1',
    cliente_id: '11111111-1111-4111-8111-111111111111',
  }

  it('acepta datos válidos', () => {
    expect(() => unidadBaseSchema.parse(valido)).not.toThrow()
  })
  it('rechaza n_motor vacío', () => {
    expect(() => unidadBaseSchema.parse({ ...valido, n_motor: '' })).toThrow()
  })
  it('rechaza n_chasis vacío', () => {
    expect(() => unidadBaseSchema.parse({ ...valido, n_chasis: '' })).toThrow()
  })
  it('rechaza modelo fuera del enum', () => {
    expect(() => unidadBaseSchema.parse({ ...valido, modelo: 'Modelo Inexistente' })).toThrow()
  })
  it('rechaza color fuera del enum', () => {
    expect(() => unidadBaseSchema.parse({ ...valido, color: 'Morado' })).toThrow()
  })
  it('acepta color nulo (opcional)', () => {
    expect(() => unidadBaseSchema.parse({ ...valido, color: null })).not.toThrow()
  })
  it('rechaza cliente_id que no es UUID', () => {
    expect(() => unidadBaseSchema.parse({ ...valido, cliente_id: 'no-es-uuid' })).toThrow()
  })
})

describe('compraSchema', () => {
  it('acepta todos los campos ausentes (todos opcionales)', () => {
    expect(() => compraSchema.parse({})).not.toThrow()
  })
  it('rechaza precio_compra_moto negativo', () => {
    expect(() => compraSchema.parse({ precio_compra_moto: -1 })).toThrow()
  })
  it('acepta precio_compra_moto en cero', () => {
    expect(() => compraSchema.parse({ precio_compra_moto: 0 })).not.toThrow()
  })
})

describe('fibraSchema', () => {
  it('acepta todos los campos ausentes (todos opcionales)', () => {
    expect(() => fibraSchema.parse({})).not.toThrow()
  })
  it('rechaza precio_fibra negativo', () => {
    expect(() => fibraSchema.parse({ precio_fibra: -1 })).toThrow()
  })
})
