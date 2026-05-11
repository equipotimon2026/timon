/**
 * MIPS Form E2E Tests
 *
 * The MIPS form is a chat-style questionnaire with 92 statements, each answered
 * with one of 3 options ("Me siento identificado/a", "A veces", "No me identifica").
 * There are 4 icebreaker interruptions at statements 20, 45, 65, 80.
 *
 * Strategy: answer every question with "A veces" (the middle option), handle
 * icebreakers by picking the first visible option, and verify the progress counter
 * reaches 92/92 with "Respuestas guardadas ✓".
 *
 * NOTE: This test has a long runtime (~3-5 min) due to animation delays.
 * Timeouts are set generously.
 *
 * IMPORTANT: We do NOT click the final "Enviar a revisión" / "Analizar" button —
 * the form auto-saves when the last statement is answered.
 */

import { test, expect } from '@playwright/test'
import { login } from '../helpers/forms'

test.describe.configure({ mode: 'serial' })

test.describe('MIPS form', () => {
  test.setTimeout(900_000) // 15 min max — 92 statements + icebreakers + delays

  test('completes all 92 MIPS statements and reaches saved state', async ({ page }) => {
    await login(page)
    await page.goto('/es/assessment/mips')
    await expect(page).toHaveURL(/assessment\/mips/, { timeout: 15000 })

    // Wait for the first statement options to appear (intro + 1.2s delay)
    const firstOption = page.getByRole('button', { name: 'A veces' }).first()
    await firstOption.waitFor({ state: 'visible', timeout: 30000 })

    // All statement options in preference order
    const STATEMENT_OPTS = ['A veces', 'Me siento identificado/a', 'No me identifica']
    // All icebreaker options (first option from each icebreaker, plus fallbacks)
    const ICEBREAKER_OPTS = [
      'Café ☕', 'Mate 🧉',           // icebreaker 1 (after 20)
      'Mañanas 🌅', 'Noches 🌙',     // icebreaker 2 (after 45)
      'Perro 🐶', 'Gato 🐱',         // icebreaker 3 (after 65)
      'Exquisitez total 🍕', 'Crimen. Sin dudas.', // icebreaker 4 (after 80)
    ]

    let answered = 0
    const totalStatements = 92

    // Loop until all 92 answered or end state reached
    while (answered < totalStatements) {
      // Check for end state first
      const endText = page.getByText('Respuestas guardadas ✓')
      if (await endText.isVisible().catch(() => false)) break

      // Try statement options — wait a bit longer for React to render after last click
      let clicked = false
      for (const opt of STATEMENT_OPTS) {
        const btn = page.getByRole('button', { name: opt }).first()
        if (await btn.isVisible({ timeout: 800 }).catch(() => false)) {
          await btn.click()
          answered++
          clicked = true
          // Wait for inputMode to cycle none→statement before polling again
          await page.waitForTimeout(400)
          break
        }
      }

      if (clicked) continue

      // Try icebreaker options
      for (const opt of ICEBREAKER_OPTS) {
        const escaped = opt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const btn = page.getByRole('button', { name: new RegExp(escaped, 'i') }).first()
        if (await btn.isVisible({ timeout: 800 }).catch(() => false)) {
          await btn.click()
          clicked = true
          // Icebreaker ack takes ~900ms before next statement renders
          await page.waitForTimeout(1200)
          break
        }
      }

      if (!clicked) {
        // Animation still in progress — wait for next render cycle
        await page.waitForTimeout(800)
      }

      // Safety: break if end state appeared
      if (await page.getByText('Respuestas guardadas ✓').isVisible().catch(() => false)) break
    }

    // Verify end state: "Respuestas guardadas ✓" appears (save may take a moment)
    await expect(page.getByText('Respuestas guardadas ✓')).toBeVisible({ timeout: 20000 })

    // Verify progress counter shows 92/92
    await expect(page.getByText('92 / 92')).toBeVisible()
  })
})
