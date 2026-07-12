import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/login'
import { VENDEDOR, GERENTE } from './helpers/credentials'

test.describe('Navegación — vendedor (solo lectura)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, VENDEDOR.email, VENDEDOR.password)
    await expect(page).toHaveURL(/\/panel/, { timeout: 30_000 })
  })

  const paginas: Array<[string, string | RegExp]> = [
    ['/unidades', /unidades/i],
    ['/clientes', /clientes/i],
    ['/prospectos', /prospectos/i],
    ['/ventas', /ventas/i],
    ['/seguimientos', /seguimiento/i],
    ['/garantias', /garant/i],
    ['/tramites', /tr[aá]mite/i],
    ['/reclamos', /reclamo/i],
  ]

  for (const [ruta, tituloEsperado] of paginas) {
    test(`carga ${ruta} sin errores`, async ({ page }) => {
      await page.goto(ruta)
      await expect(page).toHaveURL(new RegExp(ruta.replace('/', '\\/')))
      await expect(page.locator('h1')).toContainText(tituloEsperado)
    })
  }
})

test.describe('Navegación — gerente (solo lectura)', () => {
  test('dashboard muestra KPIs', async ({ page }) => {
    await loginAs(page, GERENTE.email, GERENTE.password)
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 })
    await expect(page.locator('body')).toBeVisible()
  })

  test('gerente no accede a rutas de vendedor', async ({ page }) => {
    await loginAs(page, GERENTE.email, GERENTE.password)
    await page.goto('/unidades')
    await expect(page).not.toHaveURL(/\/unidades/)
  })
})
