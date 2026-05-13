/**
 * Gardner (Inteligencias Múltiples / Termómetro) Form E2E Tests
 *
 * Flow: 40 questions + 2 cleansers + 1 checkpoint = 43 flow items.
 * Each question: move slider (1-5, integer step), click "Siguiente →".
 * Cleansers: also have a slider + "Siguiente →".
 * Checkpoint (at question 20): click "Dale, sigo".
 *
 * Regression coverage:
 *  - Slider must use integer step (was step=0.01 → floats → DB INTEGER 22P02 error).
 *  - "Finalizar →" must save without "No pudimos guardar tus respuestas" banner.
 *  - Completed screen must render after save.
 *
 * Saving Gardner only persists answers to DB — it does NOT trigger the AI
 * analysis pipeline (that runs on a separate "Enviar a revisión" action),
 * so clicking "Finalizar →" here is safe per the project's no-AI-in-tests rule.
 */

import { test, expect } from '@playwright/test'
import { login } from '../helpers/forms'

test.describe.configure({ mode: 'serial' })

test.describe('Gardner (Termómetro) form', () => {
  test.setTimeout(300_000) // 5 min — 40 questions with animations

  test('slider snaps to integer values (regression: step=1)', async ({ page }) => {
    await login(page)
    await page.goto('/es/assessment/gardner')
    await expect(page).toHaveURL(/assessment\/gardner/, { timeout: 15000 })

    const slider = page.locator('input[type="range"]').first()
    await slider.waitFor({ state: 'visible', timeout: 30000 })

    // step attribute must be "1" (integer). Was "0.01" → floats → DB INTEGER rejection.
    await expect(slider).toHaveAttribute('step', '1')
    await expect(slider).toHaveAttribute('min', '1')
    await expect(slider).toHaveAttribute('max', '5')

    // Sanity: each integer in 1..5 must round-trip.
    for (const v of ['1', '2', '3', '4', '5']) {
      await slider.fill(v)
      expect(await slider.inputValue()).toBe(v)
    }

    // Confirm Playwright itself rejects decimals against step=1 (defense check).
    await expect(slider.fill('3.7')).rejects.toThrow(/malformed value/i)
  })

  test('completes 40 questions, clicks Finalizar, saves without error', async ({ page }) => {
    await login(page)
    await page.goto('/es/assessment/gardner')
    await expect(page).toHaveURL(/assessment\/gardner/, { timeout: 15000 })

    const slider = page.locator('input[type="range"]').first()
    await slider.waitFor({ state: 'visible', timeout: 30000 })

    const TOTAL_QUESTIONS = 40
    const MAX_ITERATIONS = 50

    let finalizarClicked = false
    for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
      const finalizarBtn = page.getByRole('button', { name: /finalizar/i })
      if (await finalizarBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        await expect(page.getByText(`${TOTAL_QUESTIONS} / ${TOTAL_QUESTIONS}`)).toBeVisible({ timeout: 5000 })

        const currentSlider = page.locator('input[type="range"]').first()
        if (await currentSlider.isVisible({ timeout: 500 }).catch(() => false)) {
          await currentSlider.fill('4')
        }

        await finalizarBtn.click()
        finalizarClicked = true
        break
      }

      const checkpointBtn = page.getByRole('button', { name: /dale.*sigo|sigo/i })
      if (await checkpointBtn.isVisible({ timeout: 300 }).catch(() => false)) {
        await checkpointBtn.click()
        await page.waitForTimeout(400)
        continue
      }

      const currentSlider = page.locator('input[type="range"]').first()
      if (await currentSlider.isVisible({ timeout: 1000 }).catch(() => false)) {
        await currentSlider.fill('4')
      }

      const nextBtn = page.getByRole('button', { name: /siguiente/i }).first()
      if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nextBtn.click()
        await page.waitForTimeout(300)
      } else {
        await page.waitForTimeout(800)
      }
    }

    expect(finalizarClicked, 'Reached Finalizar button within MAX_ITERATIONS').toBe(true)

    // Regression: error banner must NOT appear after save.
    const errorBanner = page.getByText(/no pudimos guardar tus respuestas/i)
    await expect(errorBanner).toBeHidden({ timeout: 5000 })

    // Completion screen must render.
    await expect(page.getByText(/módulo completado/i)).toBeVisible({ timeout: 8000 })
  })
})
