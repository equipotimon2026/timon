/**
 * Vibecheck Form E2E Tests
 *
 * Structure:
 * - 7 persona cards (accordion-style)
 * - Click "Leer historia completa" to expand a card
 * - Click "Me resuena esta historia" to select a persona
 * - A follow-up question textarea appears (min 50 chars to enable submit)
 * - "Guardar y continuar" button enables when >= 50 chars
 *
 * Strategy:
 * - Expand the first persona card
 * - Click "Me resuena esta historia"
 * - Fill the textarea with >= 50 chars
 * - Verify "Guardar y continuar" button is visible and enabled
 * - Do NOT click "Guardar y continuar" (triggers save)
 */

import { test, expect } from '@playwright/test'
import { login } from '../helpers/forms'

test.describe.configure({ mode: 'serial' })

test.describe('Vibecheck form', () => {
  test.setTimeout(60_000)

  test('selects a persona, fills follow-up, shows enabled Guardar button', async ({ page }) => {
    await login(page)
    await page.goto('/es/assessment/vibecheck')
    await expect(page).toHaveURL(/assessment\/vibecheck/, { timeout: 15000 })

    // Wait for heading (heading may contain <br> so getByText won't match across nodes)
    await expect(page.getByRole('heading').filter({ hasText: /identificado/i }).first()).toBeVisible({ timeout: 15000 })

    // Expand the first persona card by clicking "Leer historia completa"
    const readMoreBtn = page.getByRole('button', { name: /leer historia completa/i }).first()
    await readMoreBtn.waitFor({ state: 'visible', timeout: 10000 })
    await readMoreBtn.click()

    // Click "Me resuena esta historia" to select the persona
    const resonaBtn = page.getByRole('button', { name: /me resuena esta historia/i }).first()
    await resonaBtn.waitFor({ state: 'visible', timeout: 10000 })
    await resonaBtn.click()

    // The follow-up question section should appear
    // Fill the textarea with >= 50 chars
    const ta = page.locator('textarea').first()
    await ta.waitFor({ state: 'visible', timeout: 10000 })

    const longAnswer = 'Esta es mi respuesta a la pregunta de seguimiento. Tengo más de cincuenta caracteres para que el botón se active correctamente.'
    await ta.fill(longAnswer)

    // Verify character counter shows >= 50 ✓
    await expect(page.getByText(/✓/)).toBeVisible({ timeout: 5000 })

    // Verify "Guardar y continuar" button is enabled
    const guardarBtn = page.getByRole('button', { name: /guardar y continuar/i })
    await guardarBtn.waitFor({ state: 'visible', timeout: 8000 })
    await expect(guardarBtn).toBeVisible()
    await expect(guardarBtn).not.toBeDisabled({ timeout: 5000 })
    // Do NOT click — triggers save
  })
})
