/**
 * BUG-05: Chatiemos (MIPS) — verificar que NO hay mensajes duplicados
 */
import { test, expect } from '@playwright/test'
import { login } from '../helpers/forms'

test('BUG-05: MIPS intro messages NOT duplicated', async ({ page }) => {
  test.setTimeout(60_000)
  await login(page)
  await page.goto('/es/assessment/mips')
  await expect(page).toHaveURL(/mips/, { timeout: 15000 })

  // Wait for first statement to appear
  await page.getByRole('button', { name: 'A veces' }).first().waitFor({ state: 'visible', timeout: 30_000 })

  // Count occurrences of intro messages
  const introCount = await page.getByText('Vamos a leer unas frases', { exact: false }).count()
  const dividerCount = await page.getByText('Parte 1: Personalidad', { exact: false }).count()
  const firstStatementCount = await page.getByText('Soy una persona tranquila y colaboradora', { exact: false }).count()

  console.log('[BUG-05] "Vamos a leer..." count:', introCount)
  console.log('[BUG-05] "Parte 1: Personalidad" count:', dividerCount)
  console.log('[BUG-05] First statement count:', firstStatementCount)

  expect(introCount).toBe(1)
  expect(dividerCount).toBe(1)
  expect(firstStatementCount).toBe(1)
})
