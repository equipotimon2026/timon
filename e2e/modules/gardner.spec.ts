/**
 * Gardner (Inteligencias Múltiples / Termómetro) Form E2E Tests
 *
 * Flow: 40 questions + 2 cleansers + 1 checkpoint = 43 flow items.
 * Each question: move slider (1-5), click "Siguiente →".
 * Cleansers: also have a slider + "Siguiente →".
 * Checkpoint (at question 20): click "Dale, sigo".
 *
 * Strategy:
 * - Set slider to 4 and click "Siguiente →" for each item.
 * - Handle checkpoint by clicking "Dale, sigo".
 * - Verify progress reaches 40/40.
 * - The last item shows "Finalizar →" — verify it's visible but do NOT click.
 *
 * NOTE: The form auto-saves when "Finalizar →" is clicked (which we skip).
 * After the loop, we check the progress counter shows "40 / 40".
 */

import { test, expect } from '@playwright/test'
import { login } from '../helpers/forms'

test.describe.configure({ mode: 'serial' })

test.describe('Gardner (Termómetro) form', () => {
  test.setTimeout(300_000) // 5 min — 40 questions with animations

  test('completes all 40 questions and reaches the Finalizar button', async ({ page }) => {
    await login(page)
    await page.goto('/es/assessment/gardner')
    await expect(page).toHaveURL(/assessment\/gardner/, { timeout: 15000 })

    // Wait for the first question/slider to appear
    const slider = page.locator('input[type="range"]').first()
    await slider.waitFor({ state: 'visible', timeout: 30000 })

    const TOTAL_QUESTIONS = 40
    // Flow has 43 items: 40 questions + 2 cleansers + 1 checkpoint
    const MAX_ITERATIONS = 50

    for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
      // Check if we're done (Finalizar button)
      const finalizarBtn = page.getByRole('button', { name: /finalizar/i })
      if (await finalizarBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        // Verify progress shows 40/40
        await expect(page.getByText(`${TOTAL_QUESTIONS} / ${TOTAL_QUESTIONS}`)).toBeVisible({ timeout: 5000 })
        // Verify button is present — do NOT click
        await expect(finalizarBtn).toBeVisible()
        return
      }

      // Check for checkpoint ("Dale, sigo" button)
      const checkpointBtn = page.getByRole('button', { name: /dale.*sigo|sigo/i })
      if (await checkpointBtn.isVisible({ timeout: 300 }).catch(() => false)) {
        await checkpointBtn.click()
        await page.waitForTimeout(400)
        continue
      }

      // Normal question or cleanser: set slider and click "Siguiente →"
      const currentSlider = page.locator('input[type="range"]').first()
      if (await currentSlider.isVisible({ timeout: 1000 }).catch(() => false)) {
        await currentSlider.fill('4')
      }

      const nextBtn = page.getByRole('button', { name: /siguiente/i }).first()
      if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nextBtn.click()
        await page.waitForTimeout(300)
      } else {
        // Wait for next item to render
        await page.waitForTimeout(800)
      }
    }

    // If we exhausted iterations, check for finalizar as a soft assertion
    const finalizarBtn = page.getByRole('button', { name: /finalizar/i })
    await expect.soft(finalizarBtn).toBeVisible({ timeout: 10000 })
  })
})
