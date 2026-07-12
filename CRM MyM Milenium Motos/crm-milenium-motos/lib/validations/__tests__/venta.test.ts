// lib/validations/__tests__/venta.test.ts
import { describe, it, expect } from 'vitest'
import { ventaSchema, ventaUpdateSchema } from '../venta'

describe('ventaSchema', () => {
  const valido = {
    tipo_venta: 'Contado' as const,
    fecha_venta: '2026-01-15',
    precio_venta: 15000,
    documento_tipo: 'Factura' as const,
    documento_numero: 'F-001',
    cliente_id: '11111111-1111-4111-8111-111111111111',
  }

  it('acepta datos válidos', () => {
    expect(() => ventaSchema.parse(valido)).not.toThrow()
  })
  it('rechaza tipo_venta fuera del enum', () => {
    expect(() => ventaSchema.parse({ ...valido, tipo_venta: 'Crédito' })).toThrow()
  })
  it('rechaza fecha_venta vacía', () => {
    expect(() => ventaSchema.parse({ ...valido, fecha_venta: '' })).toThrow()
  })
  it('rechaza precio_venta negativo', () => {
    expect(() => ventaSchema.parse({ ...valido, precio_venta: -1 })).toThrow()
  })
  it('acepta precio_venta en cero', () => {
    expect(() => ventaSchema.parse({ ...valido, precio_venta: 0 })).not.toThrow()
  })
  it('rechaza cliente_id que no es UUID', () => {
    expect(() => ventaSchema.parse({ ...valido, cliente_id: 'no-es-uuid' })).toThrow()
  })
  it('acepta documento_tipo nulo (opcional)', () => {
    expect(() => ventaSchema.parse({ ...valido, documento_tipo: null })).not.toThrow()
  })
})

describe('ventaUpdateSchema', () => {
  it('acepta solo el subconjunto editable (sin tipo_venta ni cliente_id)', () => {
    expect(() => ventaUpdateSchema.parse({
      fecha_venta: '2026-01-15',
      precio_venta: 15000,
      documento_tipo: 'Boleta',
      documento_numero: 'B-002',
    })).not.toThrow()
  })
  it('rechaza precio_venta negativo', () => {
    expect(() => ventaUpdateSchema.parse({ fecha_venta: '2026-01-15', precio_venta: -1 })).toThrow()
  })
})
