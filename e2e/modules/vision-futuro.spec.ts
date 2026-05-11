/**
 * Vision de Futuro Form E2E Tests
 *
 * 3 sections navigated by "Siguiente" / "Anterior" buttons:
 *   0: Visualizaciones — multiple textareas
 *   1: Lugar Fantaseado — multiple textareas
 *   2: Preguntas de Profundidad — multiple textareas
 *
 * "Guardar" button on section 2 is enabled when each section has at least 1 filled textarea.
 *
 * Strategy:
 * - Fill at least 1 textarea in each section
 * - Navigate using "Siguiente" / section navigation
 * - On the last section verify "Guardar" button is visible and enabled
 * - Do NOT click "Guardar" (triggers save)
 */

import { test, expect } from '@playwright/test'
import { login } from '../helpers/forms'

test.describe.configure({ mode: 'serial' })

test.describe('Vision de Futuro form', () => {
  test.setTimeout(90_000)

  test('fills all 3 sections and shows enabled Guardar button', async ({ page }) => {
    await login(page)
    await page.goto('/es/assessment/vision-futuro')
    await expect(page).toHaveURL(/assessment\/vision-futuro/, { timeout: 15000 })

    // Wait for form header
    await expect(page.getByText(/vision de futuro/i).first()).toBeVisible({ timeout: 15000 })

    const SAMPLE = 'Respuesta de ejemplo para el test E2E. Este texto es suficientemente descriptivo para pasar la validación.'

    // Section 0: Visualizaciones
    await expect(page.getByText('1 / 3')).toBeVisible({ timeout: 10000 })
    const ta0 = page.locator('textarea').first()
    await ta0.waitFor({ state: 'visible', timeout: 10000 })
    await ta0.fill(SAMPLE)

    // Navigate to section 1
    const nextBtn = page.getByRole('button', { name: /siguiente/i })
    await nextBtn.waitFor({ state: 'visible', timeout: 8000 })
    // Wait for button to be enabled (section must have >= 1 filled)
    await expect(nextBtn).not.toBeDisabled({ timeout: 5000 })
    await nextBtn.click()

    // Section 1: Lugar Fantaseado
    await expect(page.getByText('2 / 3')).toBeVisible({ timeout: 10000 })
    const ta1 = page.locator('textarea').first()
    await ta1.waitFor({ state: 'visible', timeout: 10000 })
    await ta1.fill(SAMPLE)

    // Navigate to section 2
    const nextBtn2 = page.getByRole('button', { name: /siguiente/i })
    await nextBtn2.waitFor({ state: 'visible', timeout: 8000 })
    await expect(nextBtn2).not.toBeDisabled({ timeout: 5000 })
    await nextBtn2.click()

    // Section 2: Preguntas de Profundidad
    await expect(page.getByText('3 / 3')).toBeVisible({ timeout: 10000 })
    const ta2 = page.locator('textarea').first()
    await ta2.waitFor({ state: 'visible', timeout: 10000 })
    await ta2.fill(SAMPLE)

    // Verify "Guardar" button is visible and enabled
    const guardarBtn = page.getByRole('button', { name: /guardar/i })
    await guardarBtn.waitFor({ state: 'visible', timeout: 8000 })
    await expect(guardarBtn).toBeVisible()
    await expect(guardarBtn).not.toBeDisabled({ timeout: 5000 })
    // Do NOT click — triggers save
  })
})
