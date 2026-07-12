import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/login'
import { VENDEDOR } from './helpers/credentials'

// Este spec crea una unidad de prueba y la elimina al final: es el único flujo
// del CRM que tiene una acción de borrado real (eliminarUnidad), por lo que
// puede quedar 100% limpio en la base de datos real.
test('vendedor crea una unidad y la elimina (flujo completo y limpio)', async ({ page }) => {
  const sufijo = Date.now().toString().slice(-8)
  const nMotor = `E2E-TEST-MTR-${sufijo}`
  const nChasis = `E2E-TEST-CHS-${sufijo}`

  await loginAs(page, VENDEDOR.email, VENDEDOR.password)
  await expect(page).toHaveURL(/\/panel/, { timeout: 30_000 })

  await page.goto('/unidades/nueva')
  await page.getByLabel('N° Motor *').fill(nMotor)
  await page.getByLabel('N° Chasis *').fill(nChasis)

  await page.getByRole('combobox', { name: /modelo/i }).click()
  await page.getByRole('option', { name: 'Deluxe GS' }).click()

  await page.getByRole('combobox', { name: /tipo de ingreso/i }).click()
  await page.getByRole('option', { name: 'Stock' }).click()

  await page.getByRole('button', { name: /registrar unidad/i }).click()

  // Tras crear, la app redirige a la ficha de la unidad
  await expect(page).toHaveURL(/\/unidades\/[0-9a-f-]+/)
  await expect(page.locator('h1')).toContainText(nMotor)

  // Volver al listado y confirmar que aparece
  await page.goto('/unidades')
  await expect(page.locator(`text=${nMotor}`)).toBeVisible()

  // Limpieza: eliminar la unidad de prueba
  page.once('dialog', (dialog) => dialog.accept())
  const fila = page.locator('a', { hasText: nMotor })
  await fila.locator('..').getByTitle('Eliminar unidad').click()

  await expect(page.locator(`text=${nMotor}`)).not.toBeVisible({ timeout: 10_000 })
})
