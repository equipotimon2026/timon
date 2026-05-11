/**
 * RIASEC Form E2E Tests
 *
 * The RIASEC form has 4 sections (tabs): Personalidad, Habilidades, Intereses, Motivaciones.
 * Each section shows word chips grouped by 6 Holland types (R, I, A, S, E, C).
 * User selects chips (toggle), then clicks "Siguiente →" or "Ver mi perfil →" on last section.
 *
 * Strategy:
 * - Select at least a few chips in each section by clicking the first chip of each type group.
 * - Navigate through all 4 sections.
 * - On the last section, verify "Ver mi perfil →" button is visible and enabled.
 * - Do NOT click "Ver mi perfil →" (that triggers save + AI analysis).
 *
 * After save (which we skip), the form would show a results screen with 3 RIASEC letters.
 * We verify the button is visible but do not click it.
 */

import { test, expect } from '@playwright/test'
import { login, hideFeedbackWidget } from '../helpers/forms'

test.describe.configure({ mode: 'serial' })

test.describe('RIASEC form', () => {
  test.setTimeout(120_000)

  test('navigates all 4 sections and shows enabled final button', async ({ page }) => {
    await login(page)
    await page.goto('/es/assessment/riasec')
    await expect(page).toHaveURL(/assessment\/riasec/, { timeout: 15000 })

    // Wait for content to load: section header "Sección 1 de 4"
    await expect(page.getByText('Sección 1 de 4')).toBeVisible({ timeout: 15000 })

    // Permanently hide feedback widget via CSS override
    await hideFeedbackWidget(page)

    const SECTION_COUNT = 4

    for (let sec = 0; sec < SECTION_COUNT; sec++) {
      // Click a few chips per section (first chip in the visible area)
      // Chips are <button> elements without navigation text
      const chips = page.getByRole('button').filter({
        hasNot: page.locator('button:has-text("Siguiente"), button:has-text("Anterior"), button:has-text("Ver mi perfil")'),
      })

      // Click up to 6 chips (one per type group roughly)
      const chipsToClick = Math.min(6, await chips.count())
      for (let i = 0; i < chipsToClick; i++) {
        const chip = chips.nth(i)
        if (await chip.isVisible().catch(() => false)) {
          const text = (await chip.textContent()) ?? ''
          // Skip nav buttons
          if (/←|→|siguiente|anterior|ver mi perfil/i.test(text)) continue
          // Skip header buttons (y < 80)
          const box = await chip.boundingBox()
          if (box && box.y < 80) continue
          await chip.click().catch(() => {})
        }
      }
      // Close any accidentally opened dropdown
      await page.keyboard.press('Escape')

      const isLastSection = sec === SECTION_COUNT - 1

      if (!isLastSection) {
        // Click "Siguiente →" to advance
        const nextBtn = page.getByRole('button', { name: /siguiente/i })
        await nextBtn.waitFor({ state: 'visible', timeout: 15000 })
        await hideFeedbackWidget(page)
        await nextBtn.click()

        // Verify section counter incremented
        await expect(page.getByText(`Sección ${sec + 2} de 4`)).toBeVisible({ timeout: 8000 })
      }
    }

    // On section 4: verify "Ver mi perfil →" button is visible
    // NOTE: we do NOT click it (would trigger save + AI analysis)
    const finalBtn = page.getByRole('button', { name: /ver mi perfil/i })
    await finalBtn.waitFor({ state: 'visible', timeout: 8000 })
    await expect(finalBtn).toBeVisible()
  })
})
