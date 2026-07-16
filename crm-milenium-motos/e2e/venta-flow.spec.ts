import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/login'
import { VENDEDOR } from './helpers/credentials'

// Flujo crítico end-to-end: prospecto -> unidad disponible -> conversión a venta -> pago.
// La app no tiene acciones de borrado para cliente/prospecto/venta (solo unidad y pago),
// así que estos registros de prueba (prefijo E2E-TEST) quedan en la base real a propósito,
// según lo acordado: se identifican fácilmente por el prefijo para limpieza manual futura.
test('vendedor convierte un prospecto en venta y registra un pago', async ({ page }) => {
  const sufijo = Date.now().toString().slice(-8)
  const nombreProspecto = `E2E-TEST Prospecto ${sufijo}`
  const nombreCliente = `E2E-TEST Cliente ${sufijo}`
  const dni = `9${sufijo}`.slice(0, 8)
  const nMotor = `E2E-TEST-MTR-V${sufijo}`
  const nChasis = `E2E-TEST-CHS-V${sufijo}`

  await loginAs(page, VENDEDOR.email, VENDEDOR.password)
  await expect(page).toHaveURL(/\/panel/, { timeout: 30_000 })

  // 1) Crear una unidad disponible para poder convertir el prospecto en venta
  await page.goto('/unidades/nueva')
  await page.getByLabel('N° Motor *').fill(nMotor)
  await page.getByLabel('N° Chasis *').fill(nChasis)
  await page.getByRole('combobox', { name: /modelo/i }).click()
  await page.getByRole('option', { name: 'Deluxe GS' }).click()
  await page.getByRole('combobox', { name: /tipo de ingreso/i }).click()
  await page.getByRole('option', { name: 'Stock' }).click()
  await page.getByRole('button', { name: /registrar unidad/i }).click()
  await expect(page).toHaveURL(/\/unidades\/[0-9a-f-]+/)

  // 2) Crear un prospecto de prueba con el mismo modelo de interés
  await page.goto('/prospectos/nuevo')
  await page.getByLabel('Nombre *').fill(nombreProspecto)
  await page.getByRole('combobox', { name: /modelo de interés/i }).click()
  await page.getByRole('option', { name: 'Deluxe GS' }).click()
  await page.getByRole('button', { name: /guardar|registrar/i }).click()
  await expect(page).toHaveURL(/\/prospectos\/[0-9a-f-]+/)
  await expect(page.locator('h1')).toContainText(nombreProspecto)

  // 3) Paso 1 del flujo de conversión: datos del cliente
  await page.getByLabel('Nombre completo *').fill(nombreCliente)
  await page.getByLabel('DNI *').fill(dni)
  await page.getByRole('button', { name: /siguiente/i }).click()

  // 4) Paso 2: seleccionar la unidad recién creada
  // Nota: el <Label> de este combobox no tiene htmlFor/id (bug de accesibilidad
  // menor en ConvertirVentaFlow), así que no expone nombre accesible; se
  // identifica por su placeholder "Seleccionar unidad".
  await page.getByRole('combobox').filter({ hasText: 'Seleccionar unidad' }).click()
  await page.getByRole('option', { name: new RegExp(nMotor) }).click()
  await page.getByRole('button', { name: /siguiente/i }).click()

  // 5) Paso 3: registrar la venta
  await page.getByLabel(/precio de venta/i).fill('15000')
  await page.getByRole('button', { name: /confirmar venta/i }).click()

  // convertirEnVenta redirige a la ficha de la unidad
  await expect(page).toHaveURL(/\/unidades\/[0-9a-f-]+/, { timeout: 30_000 })

  // 6) Abrir la sección de Pagos y registrar un pago
  await page.getByRole('button', { name: 'Pagos' }).click()
  await page.getByRole('button', { name: /registrar pago/i }).click()
  await page.getByLabel(/monto/i).fill('5000')
  await page.getByLabel(/n.*recibo/i).fill(`E2E-TEST-REC-${sufijo}`)
  await page.getByRole('button', { name: /^registrar pago$/i }).last().click()

  await expect(page.locator('text=/5,000|5000/')).toBeVisible({ timeout: 10_000 })
})
