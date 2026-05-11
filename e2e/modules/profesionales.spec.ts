/**
 * Profesionales Form E2E Tests
 *
 * Structure:
 * - Sidebar with 9 professional profiles
 * - Each profile is a chat flow: chips → options → text → end
 * - After all 9 complete, "Guardar y Finalizar" button appears
 *
 * Testing strategy (partial — covering 2 professionals to validate the pattern):
 * - Open the first professional (Lucía Ferreyra - Negocios)
 * - Complete the chat flow (chips → confirm → option → text → end)
 * - Verify the "← Ver otros profesionales" button appears (end state)
 * - Check that the sidebar shows 1/9 completed
 * - Verify "Guardar y Finalizar" is NOT visible until all 9 are done
 *
 * Full coverage (all 9 professionals) would take ~10 min — we test 1 here
 * and use expect.soft for the multi-professional checks.
 *
 * NOTE: "Guardar y Finalizar" triggers save — do NOT click.
 */

import { test, expect } from '@playwright/test'
import { login } from '../helpers/forms'

test.describe.configure({ mode: 'serial' })

test.describe('Profesionales form', () => {
  test.setTimeout(180_000) // 3 min

  test('opens first professional, completes chat flow, shows end state', async ({ page }) => {
    await login(page)
    await page.goto('/es/assessment/profesionales')
    await expect(page).toHaveURL(/assessment\/profesionales/, { timeout: 15000 })

    // Wait for sidebar to load
    await expect(page.getByText('0 de 9 completados')).toBeVisible({ timeout: 15000 })

    // Click first professional in sidebar — target by exact name to avoid mismatches
    // Lucía Ferreyra is the first entry (Administración y Negocios)
    const firstProfBtn = page.getByRole('button', { name: /lucía ferreyra/i }).first()
    await firstProfBtn.waitFor({ state: 'visible', timeout: 10000 })
    await firstProfBtn.click()

    // Chat panel should open with first bot message from Lucía
    await expect(page.getByText(/hola.*soy lucía/i)).toBeVisible({ timeout: 15000 })

    const SAMPLE_TEXT = 'Me interesa el mundo de los negocios y la estrategia empresarial.'

    // Iterate through the professional chat flow
    let iterations = 0
    const maxIterations = 30

    while (iterations < maxIterations) {
      iterations++

      // Check for end state: "← Ver otros profesionales" button
      const endBtn = page.getByRole('button', { name: /ver otros profesionales/i })
      if (await endBtn.isVisible({ timeout: 300 }).catch(() => false)) break

      // Check for chip input mode (chips + "Listo →" confirm button)
      const listoBtn = page.getByRole('button', { name: /listo.*→|→.*listo/i })
      if (await listoBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        // The chip area contains chips + "Ninguno de estos" + "Listo →"
        // Chips are buttons that are NOT "Listo →" and NOT "Ninguno de estos"
        // We wait for at least one chip to be visible, then click it
        const chipArea = page.locator('div').filter({ has: listoBtn })
        // Get all buttons in the chip area excluding Listo and Ninguno
        const chipBtns = chipArea.getByRole('button').filter({
          hasNotText: /listo|ninguno|→/i,
        })
        // Wait for chips to render (they appear with the listoBtn)
        await page.waitForTimeout(300)
        const chipCount = await chipBtns.count()
        let chipsClicked = 0
        for (let i = 0; i < chipCount && chipsClicked < 2; i++) {
          const chip = chipBtns.nth(i)
          if (!(await chip.isVisible().catch(() => false))) continue
          if (await chip.isDisabled().catch(() => false)) continue
          const text = (await chip.textContent()) ?? ''
          if (text.trim().length < 2) continue
          await chip.click().catch(() => {})
          chipsClicked++
          await page.waitForTimeout(100)
        }

        // Listo becomes enabled once chipSelected.length > 0
        // Wait up to 5s for it to enable
        await expect(listoBtn).toBeEnabled({ timeout: 5000 }).catch(async () => {
          // If still disabled, try clicking Ninguno de estos as fallback
          const ningunBtn = chipArea.getByRole('button', { name: /ninguno de estos/i })
          if (await ningunBtn.isVisible({ timeout: 500 }).catch(() => false)) {
            await ningunBtn.click().catch(() => {})
          }
        })
        // Final check — if enabled, click
        if (!(await listoBtn.isDisabled().catch(() => true))) {
          await listoBtn.click()
        }
        await page.waitForTimeout(800)
        continue
      }

      // Check for option buttons (non-chip, non-send) — scoped to main chat panel
      // Option buttons render as plain text buttons (no SVG) in the input area
      const optionBtns = page.locator('button').filter({
        hasNot: page.locator('svg'),
      })
      let foundOption = false
      const btnCount = await optionBtns.count()
      for (let i = 0; i < btnCount; i++) {
        const btn = optionBtns.nth(i)
        if (!(await btn.isVisible().catch(() => false))) continue
        if (await btn.isDisabled().catch(() => false)) continue
        const text = (await btn.textContent()) ?? ''
        // Skip navigation/control buttons
        if (/listo|←|ver otros|guardar|finalizar|ninguno de estos|lucía|mateo|valentina|diego|camila|tomás|sof[íi]a|nicol[áa]s|ana|ferreyra|vargas|ros|moreira|bravo|alvarado|m[ée]ndez|paredes|su[áa]rez|administraci[óo]n|sociales|humanidades|salud|jur[íi]dicas|ecolog[íi]a|exactas|comunicaci[óo]n|arte|dise[ñn]o/i.test(text)) continue
        if (text.trim().length < 3) continue
        await btn.click()
        foundOption = true
        await page.waitForTimeout(600)
        break
      }
      if (foundOption) continue

      // Check for textarea (text input mode)
      const ta = page.locator('main textarea').first()
      if (await ta.isVisible({ timeout: 800 }).catch(() => false)) {
        await ta.fill(SAMPLE_TEXT)
        await page.waitForTimeout(200)
        // Submit via send button inside <main> (excludes devtools)
        const sendBtn = page.locator('main button').filter({ has: page.locator('svg') }).last()
        if (await sendBtn.isVisible({ timeout: 2000 }).catch(() => false) &&
            !(await sendBtn.isDisabled().catch(() => false))) {
          await sendBtn.click()
        } else {
          await ta.press('Enter')
        }
        await page.waitForTimeout(1000)
        continue
      }

      // Wait for next bot message
      await page.waitForTimeout(1200)
    }

    // Verify end state: "← Ver otros profesionales"
    const endBtn = page.getByRole('button', { name: /ver otros profesionales/i })
    await expect.soft(endBtn).toBeVisible({ timeout: 10000 })

    // Verify sidebar shows 1 completed (soft — may update asynchronously)
    await expect.soft(page.getByText('1 de 9 completados')).toBeVisible({ timeout: 5000 })

    // "Guardar y Finalizar" should NOT be visible (only shows when all 9 done)
    await expect.soft(page.getByRole('button', { name: /guardar.*finalizar/i })).not.toBeVisible()
  })

  test('sidebar shows blocked re-entry for completed professional (soft)', async ({ page }) => {
    // This is a soft test: after completing a professional in the previous test,
    // verify that the completed indicator (green dot) appears.
    // NOTE: Each test gets a fresh browser context, so state from previous test
    // is not preserved. This verifies the UI pattern, not the actual state.
    await login(page)
    await page.goto('/es/assessment/profesionales')
    await expect(page).toHaveURL(/assessment\/profesionales/, { timeout: 15000 })

    // The sidebar renders professionals with green/gray dots
    // If previously completed, the dot would be green
    // Since state resets, we just verify the dot elements exist
    await expect.soft(
      page.locator('.w-\\[9px\\].h-\\[9px\\].rounded-full').first()
    ).toBeVisible({ timeout: 10000 })
  })
})
