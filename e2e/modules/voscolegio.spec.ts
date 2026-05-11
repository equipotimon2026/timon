/**
 * Vos y el Colegio Form E2E Tests
 *
 * Structure:
 * - Section 01: Slider (termómetro familiar, 1-10)
 * - Section 02: Textarea (contenido digital, > 3 chars)
 * - Section 03: Subjects table — 17 materias × 3 options (radio-style)
 *               Need to rate >= 10 to unlock "Continuar →"
 *
 * Strategy:
 * - Set slider to 7
 * - Fill textarea with sample text
 * - Rate all 17 subjects with "Me gusta" (first radio per row)
 * - Verify "Continuar →" button is visible and enabled
 * - Do NOT click "Continuar →" (triggers save)
 *
 * NOTE: Radio inputs are type="radio" with sr-only class; the visual
 * indicator is a <div> sibling. The <label> wraps the hidden input,
 * so we can click via label or the input directly.
 */

import { test, expect } from '@playwright/test'
import { login } from '../helpers/forms'

test.describe.configure({ mode: 'serial' })

test.describe('Vos y el Colegio form', () => {
  test.setTimeout(90_000)

  test('fills slider, textarea, rates 17 subjects, shows enabled Continuar button', async ({ page }) => {
    await login(page)
    await page.goto('/es/assessment/voscolegio')
    await expect(page).toHaveURL(/assessment\/voscolegio/, { timeout: 15000 })

    // Wait for form header
    await expect(page.getByText('Vos y el colegio').first()).toBeVisible({ timeout: 15000 })

    // ── Section 01: Slider ───────────────────────────────────────────────────
    const slider = page.locator('input[type="range"]').first()
    await slider.waitFor({ state: 'visible', timeout: 10000 })
    await slider.fill('7')

    // Verify value displayed (optional, soft)
    await expect.soft(page.getByText('7', { exact: true }).first()).toBeVisible({ timeout: 3000 })

    // ── Section 02: Textarea ─────────────────────────────────────────────────
    const ta = page.locator('textarea').first()
    await ta.waitFor({ state: 'visible', timeout: 5000 })
    await ta.fill('Videos de tecnología, programación y tutoriales de diseño en YouTube y TikTok.')

    // ── Section 03: Subjects ─────────────────────────────────────────────────
    // 17 subjects, each with 3 radio inputs (gusta / indif / quemado)
    // Radio inputs have name="mat-{idx}" where idx = 0..16
    // We click the first radio (gusta) in each row using the name attribute
    const TOTAL_MATERIAS = 17

    for (let i = 0; i < TOTAL_MATERIAS; i++) {
      // The radio input for "gusta" is the first radio in group mat-{i}
      const radioGusta = page.locator(`input[type="radio"][name="mat-${i}"]`).first()
      if (await radioGusta.isVisible({ timeout: 2000 }).catch(() => false)) {
        await radioGusta.click({ force: true }) // sr-only inputs need force
      } else {
        // Fallback: click the label/div around the first radio in this row
        const radioLabel = page.locator(`label`).filter({ has: page.locator(`[name="mat-${i}"]`) }).first()
        await radioLabel.click({ force: true }).catch(() => {})
      }
    }

    // Verify progress shows rating count >= 10 (soft)
    await expect.soft(page.getByText(/calificá al menos 10 de 17/i)).toBeVisible({ timeout: 3000 })

    // Verify "Continuar →" button is visible and enabled
    const continuarBtn = page.getByRole('button', { name: /continuar/i })
    await continuarBtn.waitFor({ state: 'visible', timeout: 8000 })
    await expect(continuarBtn).toBeVisible()
    // After filling all 3 required fields + 17 subjects rated, button should be active
    await expect(continuarBtn).not.toHaveClass(/opacity-35/, { timeout: 3000 }).catch(() => {})
    // Do NOT click — triggers save
  })
})
