/**
 * Proyectivas Form E2E Tests
 *
 * Chat-style form with 2 phases:
 *   Phase 1: 12 sentence completions (FRASES)
 *   Phase 2: 6 open questions (ABIERTAS)
 * Total: 18 text responses submitted via textarea + Enter.
 *
 * Strategy:
 * - Wait for each textarea to appear (bot asks question)
 * - Fill with sample text and press Enter
 * - Verify progress counter reaches 18/18
 * - Verify "Respuestas guardadas ✓" appears (auto-save after last answer)
 *
 * NOTE: Save triggers automatically after the last open question — there is
 * no explicit submit button to worry about.
 */

import { test, expect } from '@playwright/test'
import { login } from '../helpers/forms'

test.describe.configure({ mode: 'serial' })

test.describe('Proyectivas form', () => {
  test.setTimeout(300_000) // 5 min — 18 chat exchanges with animations

  test('answers all 18 questions and reaches saved state', async ({ page }) => {
    await login(page)
    await page.goto('/es/assessment/proyectivas')
    await expect(page).toHaveURL(/assessment\/proyectivas/, { timeout: 15000 })

    // Wait for the first textarea to appear
    await expect(page.locator('textarea').first()).toBeVisible({ timeout: 30000 })

    const TOTAL_QUESTIONS = 18
    const SAMPLE_TEXT = 'Mi respuesta de ejemplo para el test automatizado.'

    for (let q = 0; q < TOTAL_QUESTIONS; q++) {
      // Check for completion state
      const savedText = page.getByText('Respuestas guardadas ✓')
      if (await savedText.isVisible({ timeout: 300 }).catch(() => false)) break

      // Wait for textarea
      const ta = page.locator('textarea').first()
      try {
        await ta.waitFor({ state: 'visible', timeout: 15000 })
      } catch {
        // Maybe already done
        break
      }

      await ta.fill(SAMPLE_TEXT)
      // Submit via Enter (the form handles Shift+Enter differently)
      await ta.press('Enter')

      // Wait for the ack message + next question (bot typing delay ~500-800ms)
      await page.waitForTimeout(1500)
    }

    // Final state: "Respuestas guardadas ✓"
    await expect(page.getByText('Respuestas guardadas ✓')).toBeVisible({ timeout: 15000 })

    // Progress counter should be at 18/18
    await expect(page.getByText('18 / 18')).toBeVisible()
  })
})
