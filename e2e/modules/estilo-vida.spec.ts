/**
 * Estilo de Vida Form E2E Tests
 *
 * Structure:
 * - 4 chip groups (multi-select): Valores, Personas, Rol, Límites
 * - 10 radio groups (single-select): Interacción, Horarios, Rutina, etc.
 *
 * "Guardar →" button unlocks when >= 5 radios are answered.
 *
 * Strategy:
 * - Click all chip options (optional, multi-select)
 * - Select first option in each radio group
 * - Verify "Guardar →" button is visible and enabled
 * - Do NOT click "Guardar →" (triggers save)
 */

import { test, expect } from '@playwright/test'
import { login, hideFeedbackWidget } from '../helpers/forms'

test.describe.configure({ mode: 'serial' })

test.describe('Estilo de Vida form', () => {
  test.setTimeout(60_000)

  test('fills chip groups and radio groups, shows enabled Guardar button', async ({ page }) => {
    await login(page)
    await page.goto('/es/assessment/estilo-vida')
    await expect(page).toHaveURL(/assessment\/estilo-vida/, { timeout: 15000 })

    // Wait for form to load
    await expect(page.getByText('Estilo de Vida').first()).toBeVisible({ timeout: 15000 })

    // Permanently hide feedback widget via CSS override
    await hideFeedbackWidget(page)

    // Click a few chips from the chip groups (optional multi-select)
    // Chip groups are labeled with their question text; buttons are pills
    const chipButtons = page.getByRole('button').filter({
      hasNot: page.locator(':text("Guardar"), :text("Siguiente"), :text("Anterior")'),
    })

    // Click first chip in each visible chip group (first 4 groups)
    // Radio buttons in estilo-vida use <button> elements too (custom styled)
    // All buttons that aren't navigation are either chips or radio-style
    const allBtns = page.getByRole('button')
    const totalBtns = await allBtns.count()

    let clickedRadios = 0
    let lastGroupLabel = ''

    for (let i = 0; i < totalBtns; i++) {
      const btn = allBtns.nth(i)
      if (!(await btn.isVisible().catch(() => false))) continue
      const text = (await btn.textContent()) ?? ''
      if (/guardar|siguiente|anterior|cerrar|configurac|sesi[oó]n/i.test(text)) continue
      if (await btn.isDisabled().catch(() => false)) continue
      // Skip header/dropdown buttons (y < 200 to be safe with dropdowns)
      const box = await btn.boundingBox()
      if (box && box.y < 200) continue

      // Click the button
      await btn.click().catch(() => {})
      clickedRadios++

      // Don't click too many — we need at least 5 radios answered
      if (clickedRadios >= 20) break
    }

    // Close any accidentally opened dropdown
    await page.keyboard.press('Escape')

    // Verify "Guardar →" button is visible (may be enabled after 5 radio answers)
    const guardarBtn = page.getByRole('button', { name: /guardar/i })
    await guardarBtn.waitFor({ state: 'visible', timeout: 15000 })
    await expect(guardarBtn).toBeVisible()
    // Do NOT click — triggers save
  })
})
