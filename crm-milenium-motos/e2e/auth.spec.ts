import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/login'
import { VENDEDOR, GERENTE } from './helpers/credentials'

test.describe('Autenticación', () => {
  test('vendedor inicia sesión y aterriza en /panel', async ({ page }) => {
    await loginAs(page, VENDEDOR.email, VENDEDOR.password)
    // El login redirige a "/" y desde ahí el server component redirige según rol.
    await expect(page).toHaveURL(/\/panel/, { timeout: 30_000 })
  })

  test('gerente inicia sesión y aterriza en /dashboard', async ({ page }) => {
    await loginAs(page, GERENTE.email, GERENTE.password)
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 })
  })

  test('credenciales inválidas muestran error y no navegan', async ({ page }) => {
    await loginAs(page, 'no-existe@milenium.pe', 'password-incorrecto')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator('text=/error|inválid|incorrect/i')).toBeVisible({ timeout: 10_000 })
  })
})
