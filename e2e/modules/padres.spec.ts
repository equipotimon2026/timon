/**
 * Padres (Perspectiva Familiar) Form E2E Tests
 *
 * Chat-style form for parents/guardians. Flow:
 * 1. Intro message (no input)
 * 2. "¿Arrancamos?" → options: "Sí, empecemos" / "Listo/a"
 * 3. Section divider "— Sobre vos —"
 * 4-9. Text questions (name+age+job, satisfaction, career abandoned?, etc.)
 * 10. Section divider "— Sobre el/la estudiante —"
 * 11-14. More text questions
 * 15. Final "end" message (auto-save) + "Respuestas guardadas."
 *
 * Branching: step 5 asks "¿Comenzaste y abandonaste alguna carrera?"
 *   - Sí → goes to step 6 (conditional question), then step 7
 *   - No → goes straight to step 7
 *
 * Strategy:
 * - Answer "Sí, empecemos" to start
 * - Fill each textarea with sample text (min 5 chars)
 * - Answer "No" for branching question to skip conditional
 * - Complete all text questions
 * - Verify final "Respuestas guardadas" message
 *
 * NOTE: The form auto-saves internally at the end step — there is no
 * explicit save button to avoid clicking.
 */

import { test, expect } from '@playwright/test'
import { login } from '../helpers/forms'

test.describe.configure({ mode: 'serial' })

test.describe('Padres form', () => {
  test.setTimeout(300_000) // 5 min — many chat steps with delays

  test('completes the parents chat flow and reaches saved state', async ({ page }) => {
    await login(page)
    await page.goto('/es/assessment/padres')
    await expect(page).toHaveURL(/assessment\/padres/, { timeout: 15000 })

    // Wait for the form header
    await expect(page.getByText('Perspectiva Familiar').first()).toBeVisible({ timeout: 15000 })

    const SAMPLE = 'Respuesta de ejemplo para la prueba automatizada, con más de cinco caracteres.'

    // The flow starts automatically with the intro message then "¿Arrancamos?"
    // Wait for option buttons to appear
    const arrencarBtn = page.getByRole('button', { name: /sí.*empecemos|listo/i }).first()
    await arrencarBtn.waitFor({ state: 'visible', timeout: 20000 })
    await arrencarBtn.click()

    // Now iterate: for each question that appears, either fill textarea or click option
    let iterations = 0
    const maxIterations = 50

    while (iterations < maxIterations) {
      iterations++

      // Dismiss any dev overlay (Next.js route inspector) that may have opened
      await page.keyboard.press('Escape').catch(() => {})

      // Check for end state
      const endText = page.getByText(/respuestas guardadas|podés cerrar/i)
      if (await endText.isVisible({ timeout: 300 }).catch(() => false)) break

      // Check for textarea (text input mode)
      const ta = page.locator('main textarea').first()
      if (await ta.isVisible({ timeout: 800 }).catch(() => false)) {
        await ta.fill(SAMPLE)
        await page.waitForTimeout(200)
        // Submit via send button inside <main> (excludes devtools)
        const sendBtn = page.locator('main button').filter({ has: page.locator('svg') }).last()
        if (await sendBtn.isVisible({ timeout: 2000 }).catch(() => false) &&
            !(await sendBtn.isDisabled().catch(() => false))) {
          await sendBtn.click()
        } else {
          // Fallback: press Enter (Shift+Enter would add newline)
          await ta.press('Enter')
        }
        await page.waitForTimeout(1200)
        continue
      }

      // Check for option buttons (choices)
      // Look for any visible button that's not a nav/send button
      const optionBtns = page.getByRole('button').filter({
        hasNot: page.locator('svg'),
      })
      const btnCount = await optionBtns.count()
      let foundOption = false
      for (let i = 0; i < btnCount; i++) {
        const btn = optionBtns.nth(i)
        if (!(await btn.isVisible().catch(() => false))) continue
        const text = (await btn.textContent()) ?? ''
        // Skip nav/control/devtools buttons
        if (/guardar|finalizar|volver|cerrar|route|bundler|preferences|turbopack/i.test(text)) continue
        if (text.trim().length < 2) continue
        // For branching question about career, click "No" to skip conditional step
        if (/comenzaste.*abandonaste|carrera.*abandonaste/i.test(
          (await page.locator('.self-start').last().textContent() ?? '').toString()
        )) {
          const noBtn = page.getByRole('button', { name: /^No$/ })
          if (await noBtn.isVisible({ timeout: 500 }).catch(() => false)) {
            await noBtn.click()
            foundOption = true
            break
          }
        }
        await btn.click()
        foundOption = true
        break
      }

      if (foundOption) {
        await page.waitForTimeout(1000)
        continue
      }

      // Wait for next bot message
      await page.waitForTimeout(1500)
    }

    // Verify completion message
    await expect.soft(
      page.getByText(/respuestas guardadas|podés cerrar/i)
    ).toBeVisible({ timeout: 20000 })
  })
})
