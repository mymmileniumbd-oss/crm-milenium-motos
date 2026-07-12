import type { Page } from '@playwright/test'

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('Correo').fill(email)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: /ingresar/i }).click()
}
