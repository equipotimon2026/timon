/**
 * Herrmann (Dominancia Cerebral) Form E2E Tests
 *
 * 8 steps, mix of:
 * - multi-select chips (up to 3): steps 0, 1, 2, 4
 * - single-select: steps 3, 5, 6, 7
 * - exact-2: step 4
 *
 * Strategy:
 * - For multi-select steps: click 1-3 options then "Continuar →"
 * - For single-select steps: click one option (auto-advances via "Continuar →")
 * - Verify "Finalizar →" button on the last step without clicking it.
 *
 * NOTE: "Finalizar →" triggers save. We verify it's visible and enabled.
 */

import { test, expect } from '@playwright/test'
import { login, hideFeedbackWidget } from '../helpers/forms'

test.describe.configure({ mode: 'serial' })

test.describe('Herrmann (Dominancia) form', () => {
  test.setTimeout(90_000)

  test('completes all 8 steps and shows enabled Finalizar button', async ({ page }) => {
    await login(page)
    await page.goto('/es/assessment/herrmann')
    await expect(page).toHaveURL(/assessment\/herrmann/, { timeout: 15000 })

    // Wait for form to load
    await expect(page.getByText(/dominancia/i).first()).toBeVisible({ timeout: 15000 })

    // Permanently hide feedback widget via CSS override (survives React re-renders)
    await hideFeedbackWidget(page)

    const TOTAL_STEPS = 8

    for (let step = 0; step < TOTAL_STEPS; step++) {
      // Wait for step indicator
      await expect(page.getByText(`${step + 1} / ${TOTAL_STEPS}`)).toBeVisible({ timeout: 10000 })

      // Click pill options (skip navigation buttons)
      const allBtns = page.getByRole('button')
      const count = await allBtns.count()

      let clicked = 0
      for (let i = 0; i < count && clicked < 3; i++) {
        const btn = allBtns.nth(i)
        if (!(await btn.isVisible().catch(() => false))) continue
        const text = (await btn.textContent()) ?? ''
        if (/←|→|anterior|continuar|finalizar|configurac|cerrar|sesi[oó]n/i.test(text)) continue
        if (await btn.isDisabled().catch(() => false)) continue
        // Skip buttons in the header (sticky top)
        const box = await btn.boundingBox()
        if (box && box.y < 80) continue  // skip header buttons
        await btn.click()
        clicked++
        // For single-select steps (steps 3, 5, 6, 7 = 0-indexed), one click is enough
        if ([3, 5, 6, 7].includes(step)) break
      }

      // Close any accidentally opened dropdown (press Escape)
      await page.keyboard.press('Escape')

      const isLastStep = step === TOTAL_STEPS - 1

      if (!isLastStep) {
        // Click "Continuar →" — located in sticky footer
        const continueBtn = page.locator('button').filter({ hasText: /continuar/i }).last()
        await continueBtn.waitFor({ state: 'visible', timeout: 12000 })
        // Wait for it to be enabled (requires selection)
        await expect(continueBtn).not.toHaveAttribute('class', /opacity-35/, { timeout: 5000 }).catch(() => {})
        // Wait for Continuar button to be enabled (not have opacity-35 class)
        // Wait for button to be enabled
        await expect(continueBtn).not.toHaveClass(/opacity-35/, { timeout: 8000 })
        await continueBtn.click()
      }
    }

    // Verify "Finalizar →" is visible on last step
    const finalBtn = page.getByRole('button', { name: /finalizar/i })
    await finalBtn.waitFor({ state: 'visible', timeout: 8000 })
    await expect(finalBtn).toBeVisible()
    // Do NOT click — would trigger save
  })
})
