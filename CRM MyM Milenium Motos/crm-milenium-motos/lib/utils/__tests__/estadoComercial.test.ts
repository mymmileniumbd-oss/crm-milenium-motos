import { describe, it, expect } from 'vitest'
import { calcularEstadoComercial } from '../estados'

describe('calcularEstadoComercial', () => {
  it('nunca degrada desde Entregada, sin importar el resto de los parámetros', () => {
    expect(calcularEstadoComercial({
      estadoActual: 'Entregada', estadoPago: 'Pendiente', puedeSepararDesdeNull: true, sinPagos: true,
    })).toBe('Entregada')
  })

  it('pasa a Vendida cuando el estado de pago es Pagado, desde cualquier estado previo', () => {
    expect(calcularEstadoComercial({
      estadoActual: null, estadoPago: 'Pagado', puedeSepararDesdeNull: false, sinPagos: false,
    })).toBe('Vendida')
    expect(calcularEstadoComercial({
      estadoActual: 'Separada', estadoPago: 'Pagado', puedeSepararDesdeNull: false, sinPagos: false,
    })).toBe('Vendida')
  })

  // Escenario: crearPago — solo el primer Adelanto separa una unidad sin estado previo
  it('crearPago: primer Adelanto sobre unidad sin estado → Separada', () => {
    expect(calcularEstadoComercial({
      estadoActual: null, estadoPago: 'Parcial', puedeSepararDesdeNull: true, sinPagos: false,
    })).toBe('Separada')
  })

  it('crearPago: pago que no es el primer Adelanto (o no es Adelanto) sobre unidad sin estado → no cambia', () => {
    expect(calcularEstadoComercial({
      estadoActual: null, estadoPago: 'Parcial', puedeSepararDesdeNull: false, sinPagos: false,
    })).toBe(null)
  })

  it('crearPago: unidad ya Separada y llega otro pago parcial → se mantiene Separada', () => {
    expect(calcularEstadoComercial({
      estadoActual: 'Separada', estadoPago: 'Parcial', puedeSepararDesdeNull: false, sinPagos: false,
    })).toBe('Separada')
  })

  // Escenario: recalcularEstados (editarPago/eliminarPago) — siempre puede separar o volver a null
  it('recalcularEstados: sin pagos (suma 0) → vuelve a null', () => {
    expect(calcularEstadoComercial({
      estadoActual: 'Separada', estadoPago: 'Pendiente', puedeSepararDesdeNull: true, sinPagos: true,
    })).toBe(null)
  })

  it('recalcularEstados: con pagos pero no Pagado → Separada', () => {
    expect(calcularEstadoComercial({
      estadoActual: null, estadoPago: 'Parcial', puedeSepararDesdeNull: true, sinPagos: false,
    })).toBe('Separada')
  })

  // Escenario: actualizarVenta (cambio de precio) — nunca inicia desde null, solo degrada Vendida→Separada
  it('actualizarVenta: no Pagado y sin estado previo → no cambia (no inicia desde null)', () => {
    expect(calcularEstadoComercial({
      estadoActual: null, estadoPago: 'Parcial', puedeSepararDesdeNull: false, sinPagos: false,
    })).toBe(null)
  })

  it('actualizarVenta: precio subió y ya no alcanza para Pagado estando Vendida → degrada a Separada', () => {
    expect(calcularEstadoComercial({
      estadoActual: 'Vendida', estadoPago: 'Parcial', puedeSepararDesdeNull: false, sinPagos: false,
    })).toBe('Separada')
  })

  it('actualizarVenta: ya Separada y sigue sin Pagado → se mantiene Separada', () => {
    expect(calcularEstadoComercial({
      estadoActual: 'Separada', estadoPago: 'Parcial', puedeSepararDesdeNull: false, sinPagos: false,
    })).toBe('Separada')
  })
})
