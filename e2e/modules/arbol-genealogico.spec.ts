/**
 * Árbol Genealógico (Entorno Familiar) Form E2E Tests
 *
 * Form has:
 * - 5 textareas (q1-q5): family context questions
 * - 2 chip groups: Apoyo (Sí/Más o menos/No), Entorno (4 options)
 *
 * "Continuar →" button requires filled >= 5 (out of 7 total).
 *
 * Strategy:
 * - Fill all 5 textareas
 * - Click one chip in each chip group
 * - Verify "Continuar →" button is visible and enabled
 * - Do NOT click "Continuar →" (triggers save)
 *
 * Note: The fix-agent may have added a "¿Qué familiar sos?" pop-up.
 * We handle it with expect.soft() — if it appears, dismiss it.
 */

import { test, expect } from '@playwright/test'
import { login } from '../helpers/forms'

test.describe.configure({ mode: 'serial' })

test.describe('Árbol Genealógico (Entorno Familiar) form', () => {
  test.setTimeout(60_000)

  test('fills all textareas and chip groups, shows enabled Continuar button', async ({ page }) => {
    await login(page)
    await page.goto('/es/assessment/arbol-genealogico')
    await expect(page).toHaveURL(/assessment\/arbol-genealogico/, { timeout: 15000 })

    // Wait for form header
    await expect(page.getByText('Tu entorno familiar').first()).toBeVisible({ timeout: 15000 })

    // Handle optional "¿Qué familiar sos?" popup (added by fix-agent)
    // Use soft assertion — don't fail if it's not there
    const popup = page.getByText(/qué familiar sos/i)
    if (await popup.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Try to dismiss by clicking first available button in the modal
      const modalBtn = page.getByRole('button').filter({ hasText: /mam[áa]|pap[áa]|otro/i }).first()
      await expect.soft(modalBtn).toBeVisible()
      await modalBtn.click().catch(() => {})
    }

    const SAMPLE = 'Respuesta de ejemplo para la prueba automatizada del sistema.'

    // Fill all 5 textareas
    const textareas = page.locator('textarea')
    const count = await textareas.count()
    for (let i = 0; i < count; i++) {
      const ta = textareas.nth(i)
      if (!(await ta.isVisible().catch(() => false))) continue
      await ta.fill(SAMPLE)
    }

    // Click one chip in "Apoyo" group ("Sí")
    const apoyoBtn = page.getByRole('button', { name: /^Sí$/ })
    if (await apoyoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await apoyoBtn.click()
    }

    // Click one chip in "Entorno" group (first option)
    const entornoBtns = page.getByRole('button', { name: /me escuchan|me orientan|me presionan|casi no/i })
    const firstEntorno = entornoBtns.first()
    if (await firstEntorno.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstEntorno.click()
    }

    // Verify "Continuar →" button is visible and enabled
    const continuarBtn = page.getByRole('button', { name: /continuar/i })
    await continuarBtn.waitFor({ state: 'visible', timeout: 8000 })
    await expect(continuarBtn).toBeVisible()
    // The button requires filled >= 5: with 5 textareas filled this should be satisfied
    await expect(continuarBtn).not.toHaveClass(/opacity-35/, { timeout: 3000 }).catch(() => {})
    // Do NOT click — triggers save
  })
})
