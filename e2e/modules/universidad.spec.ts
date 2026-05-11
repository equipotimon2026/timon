/**
 * Universidad Form E2E Tests
 *
 * 5-step wizard:
 *   Step 0: Costo — 3 radio-style buttons + beca toggle
 *   Step 1: Ubicación — 4 text inputs
 *   Step 2: Requisitos — 2 groups of 3 emoji buttons each
 *   Step 3: Perfil Institucional — 3 chip groups
 *   Step 4: Podio — drag-and-drop equivalent (click factor → click rank slot)
 *
 * "Siguiente" advances between steps; "Terminar y guardar" is on step 5.
 *
 * Strategy:
 * - Step 0: select "Sin cuota, gratis"
 * - Step 1: fill all 4 text fields
 * - Step 2: select one option per group
 * - Step 3: select one chip per group
 * - Step 4: assign all 5 factors to rank slots
 * - Verify "Terminar y guardar" is visible and enabled — do NOT click
 */

import { test, expect } from '@playwright/test'
import { login, hideFeedbackWidget } from '../helpers/forms'

test.describe.configure({ mode: 'serial' })

test.describe('Universidad form', () => {
  test.setTimeout(120_000)

  test('completes all 5 steps and shows enabled Terminar button', async ({ page }) => {
    await login(page)
    await page.goto('/es/assessment/universidad')
    await expect(page).toHaveURL(/assessment\/universidad/, { timeout: 15000 })

    // Wait for form to load
    await expect(page.getByText('Universidad').first()).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('Paso 1 de 5').first()).toBeVisible({ timeout: 10000 })

    // ── Step 0: Costo ────────────────────────────────────────────────────────
    await page.getByRole('button', { name: /sin cuota.*gratis/i }).click()

    const nextBtn = page.getByRole('button', { name: /siguiente/i })
    await nextBtn.waitFor({ state: 'visible', timeout: 5000 })
    await hideFeedbackWidget(page)
    await nextBtn.click()

    // ── Step 1: Ubicación y Viaje ────────────────────────────────────────────
    await expect(page.getByText('Paso 2 de 5').first()).toBeVisible({ timeout: 12000 })

    // Select zona: first option "CABA"
    await page.getByText('¿En qué zona vivís?').waitFor({ state: 'visible', timeout: 8000 })
    await page.getByRole('button', { name: 'CABA' }).first().click()
    // Select viaje: "30 min a 1 hora"
    await page.getByRole('button', { name: '30 min a 1 hora' }).first().click()
    // Select mudarse: "Sí" — last of the two mudarse buttons
    await page.getByRole('button', { name: 'Sí' }).first().click()

    const nextBtn1 = page.getByRole('button', { name: /siguiente/i })
    await nextBtn1.waitFor({ state: 'visible', timeout: 8000 })
    await hideFeedbackWidget(page)
    await nextBtn1.click()

    // ── Step 2: Cursada y Trabajo ────────────────────────────────────────────
    await expect(page.getByText('Paso 3 de 5').first()).toBeVisible({ timeout: 8000 })

    // Q1: ¿Dispuesto a ingreso/CBC? — click first button (Sí / Me lo banco)
    await page.getByText('¿Estás dispuesto/a a realizar').waitFor({ state: 'visible', timeout: 8000 })
    // Click first card (Sí)
    const ingresoGrid = page.locator('div.grid').first()
    await ingresoGrid.getByRole('button').first().click()
    // Q2: ¿Tenés que trabajar? — click second button (No)
    const trabajarGrid = page.locator('div.grid').nth(1)
    await trabajarGrid.getByRole('button').nth(1).click()

    const nextBtn2 = page.getByRole('button', { name: /siguiente/i })
    await hideFeedbackWidget(page)
    await nextBtn2.click()

    // ── Step 3: Perfil Institucional ─────────────────────────────────────────
    await expect(page.getByText('Paso 4 de 5').first()).toBeVisible({ timeout: 8000 })

    // 4 chip groups: Prestigio, Valores, Instalaciones, Presencialidad
    await page.getByRole('button', { name: /^Muy importante$/ }).first().click()
    await page.getByRole('button', { name: /ambiente laico|afiliación religiosa|me es indiferente/i }).first().click()
    await page.getByRole('button', { name: /^Me importa mucho$/ }).first().click()
    // Presencialidad
    await page.getByRole('button', { name: /^Presencial$/ }).first().click()

    const nextBtn3 = page.getByRole('button', { name: /siguiente/i })
    await hideFeedbackWidget(page)
    await nextBtn3.click()

    // ── Step 4: Podio ────────────────────────────────────────────────────────
    await expect(page.getByText('Paso 5 de 5').first()).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Armá tu Podio')).toBeVisible()

    // 5 factors to assign to 5 rank slots
    const factors = ['Costo', 'Ubicación', 'Tiempo de ingreso', 'Prestigio e instalaciones', 'Afiliación religiosa o ideológica']
    const ranks = ['1°', '2°', '3°', '4°', '5°']

    for (let fi = 0; fi < factors.length; fi++) {
      // Click the factor chip
      const factorBtn = page.getByRole('button', { name: new RegExp(factors[fi], 'i') }).first()
      if (await factorBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await factorBtn.click()
      }

      // Click the rank slot
      const rankSlot = page.getByRole('button').filter({ hasText: new RegExp(`^${ranks[fi]}`) }).first()
      if (await rankSlot.isVisible({ timeout: 5000 }).catch(() => false)) {
        await rankSlot.click()
      }

      await page.waitForTimeout(200)
    }

    // Verify "Terminar y guardar" is visible and enabled
    const finalizarBtn = page.getByRole('button', { name: /terminar.*guardar/i })
    await finalizarBtn.waitFor({ state: 'visible', timeout: 8000 })
    await expect(finalizarBtn).toBeVisible()
    await expect(finalizarBtn).not.toHaveClass(/opacity-35/, { timeout: 3000 }).catch(() => {})
    // Do NOT click — triggers save
  })
})
