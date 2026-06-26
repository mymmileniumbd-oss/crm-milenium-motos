// lib/validations/__tests__/cliente.test.ts
import { describe, it, expect } from 'vitest'
import { clienteSchema } from '../cliente'

describe('clienteSchema', () => {
  const valido = { nombre_completo: 'Juan Pérez', dni: '12345678', direccion: 'Lima', telefono: '999888777', correo: 'juan@email.com' }

  it('acepta datos válidos', () => {
    expect(() => clienteSchema.parse(valido)).not.toThrow()
  })
  it('rechaza DNI de 7 dígitos', () => {
    expect(() => clienteSchema.parse({ ...valido, dni: '1234567' })).toThrow()
  })
  it('rechaza DNI de 9 dígitos', () => {
    expect(() => clienteSchema.parse({ ...valido, dni: '123456789' })).toThrow()
  })
  it('rechaza DNI con letras', () => {
    expect(() => clienteSchema.parse({ ...valido, dni: '1234567A' })).toThrow()
  })
  it('rechaza nombre vacío', () => {
    expect(() => clienteSchema.parse({ ...valido, nombre_completo: '' })).toThrow()
  })
  it('acepta correo vacío (campo opcional)', () => {
    expect(() => clienteSchema.parse({ ...valido, correo: '' })).not.toThrow()
  })
  it('rechaza correo con formato inválido (si se provee)', () => {
    expect(() => clienteSchema.parse({ ...valido, correo: 'no-es-email' })).toThrow()
  })
})
