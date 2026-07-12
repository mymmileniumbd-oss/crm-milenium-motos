// lib/validations/__tests__/pago.test.ts
import { describe, it, expect } from 'vitest'
import { pagoSchema } from '../pago'

describe('pagoSchema', () => {
  const valido = {
    fecha_pago: '2026-01-15',
    monto: 500,
    n_operacion: '123456',
    n_recibo: 'R-001',
    tipo: 'Adelanto' as const,
  }

  it('acepta datos válidos', () => {
    expect(() => pagoSchema.parse(valido)).not.toThrow()
  })
  it('rechaza fecha_pago vacía', () => {
    expect(() => pagoSchema.parse({ ...valido, fecha_pago: '' })).toThrow()
  })
  it('rechaza monto en cero', () => {
    expect(() => pagoSchema.parse({ ...valido, monto: 0 })).toThrow()
  })
  it('rechaza monto negativo', () => {
    expect(() => pagoSchema.parse({ ...valido, monto: -10 })).toThrow()
  })
  it('rechaza n_recibo vacío', () => {
    expect(() => pagoSchema.parse({ ...valido, n_recibo: '' })).toThrow()
  })
  it('acepta n_operacion ausente (opcional)', () => {
    const sinOperacion = {
      fecha_pago: valido.fecha_pago,
      monto: valido.monto,
      n_recibo: valido.n_recibo,
      tipo: valido.tipo,
    }
    expect(() => pagoSchema.parse(sinOperacion)).not.toThrow()
  })
  it('rechaza tipo fuera del enum', () => {
    expect(() => pagoSchema.parse({ ...valido, tipo: 'Otro' })).toThrow()
  })
  it.each(['Adelanto', 'Saldo', 'Contado'] as const)('acepta tipo %s', (tipo) => {
    expect(() => pagoSchema.parse({ ...valido, tipo })).not.toThrow()
  })
})
