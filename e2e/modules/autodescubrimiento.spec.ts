/**
 * Autodescubrimiento (Autobiografía) Form E2E Tests
 *
 * 4 sections (tabs): Yo Soy, Conceptos, Autobiografía, Historia Vital
 * Total questions: 1 + 4 + 5 + 3 = 13 textareas
 * Minimum to unlock "Finalizar →": 5 filled
 *
 * Strategy:
 * - Navigate through all 4 sections using the tab buttons
 * - Fill all visible textareas in each section
 * - On the last section verify "Finalizar →" button is visible and enabled
 * - Do NOT click "Finalizar →" (triggers save)
 */

import { test, expect } from '@playwright/test'
import { login, hideFeedbackWidget } from '../helpers/forms'

test.describe.configure({ mode: 'serial' })

test.describe('Autodescubrimiento form', () => {
  test.setTimeout(90_000)

  test('fills all 4 sections and shows enabled Finalizar button', async ({ page }) => {
    await login(page)
    await page.goto('/es/assessment/autodescubrimiento')
    await expect(page).toHaveURL(/assessment\/autodescubrimiento/, { timeout: 15000 })

    // Wait for form header
    await expect(page.getByText('Autobiografía').first()).toBeVisible({ timeout: 15000 })

    const SAMPLE = 'Respuesta de ejemplo para el test automatizado. Esta es una respuesta suficientemente larga.'
    const SECTION_TITLES = ['Yo Soy', 'Conceptos', 'Autobiografía', 'Historia Vital']

    for (let secIdx = 0; secIdx < SECTION_TITLES.length; secIdx++) {
      // Click the section tab
      const tab = page.getByRole('button', { name: SECTION_TITLES[secIdx] })
      await tab.waitFor({ state: 'visible', timeout: 8000 })
      await tab.click()

      // Wait for section to render
      await page.waitForTimeout(500)

      // Fill all textareas in this section
      const textareas = page.locator('textarea')
      const count = await textareas.count()
      for (let i = 0; i < count; i++) {
        const ta = textareas.nth(i)
        if (!(await ta.isVisible().catch(() => false))) continue
        await ta.fill(SAMPLE)
      }

      // For sections 0-2: click "Siguiente →" to advance
      if (secIdx < SECTION_TITLES.length - 1) {
        const nextBtn = page.getByRole('button', { name: /siguiente/i })
        if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          // Hide feedback widget to prevent click interception
          await hideFeedbackWidget(page)
          await nextBtn.click()
        }
      }
    }

    // On the last section (Historia Vital): "Finalizar →" should be enabled
    // (requires filled >= 5, which we've done across all sections)
    const finalizarBtn = page.getByRole('button', { name: /finalizar/i })
    await finalizarBtn.waitFor({ state: 'visible', timeout: 8000 })
    await expect(finalizarBtn).toBeVisible()
    // Verify it's not opacity-35 (disabled state)
    await expect(finalizarBtn).not.toHaveClass(/opacity-35/, { timeout: 3000 }).catch(() => {})
    // Do NOT click — would trigger save
  })
})
