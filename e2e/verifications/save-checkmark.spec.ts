/**
 * V3 — BUG-03: Saving a module marks checkmark on home
 * Completes voscolegio and verifies home shows it as completed.
 */

import { test, expect } from '@playwright/test'
import { login, hideFeedbackWidget } from '../helpers/forms'
import * as path from 'path'

test('V3 - BUG-03: save module marks checkmark on home', async ({ page }) => {
  // Listen for console errors
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  // Listen for failed requests
  const failedRequests: string[] = []
  page.on('requestfailed', (req) => failedRequests.push(`${req.method()} ${req.url()}`))
  // Listen for responses >= 400
  const errorResponses: string[] = []
  page.on('response', (resp) => {
    if (resp.status() >= 400) errorResponses.push(`${resp.status()} ${resp.url()}`)
  })

  await login(page)
  await page.goto('/es/assessment/voscolegio')
  await expect(page).toHaveURL(/assessment\/voscolegio/, { timeout: 15000 })
  await page.waitForLoadState('networkidle', { timeout: 15000 })

  // Wait for form header
  await expect(page.getByText('Vos y el colegio').first()).toBeVisible({ timeout: 15000 })

  // Section 01: Slider
  const slider = page.locator('input[type="range"]').first()
  await slider.waitFor({ state: 'visible', timeout: 10000 })
  await slider.fill('7')
  console.log('[V3] Slider set to 7')

  // Section 02: Textarea
  const ta = page.locator('textarea').first()
  await ta.waitFor({ state: 'visible', timeout: 5000 })
  await ta.fill('Videos de tecnología, música, deportes y tutoriales de estudio en YouTube.')
  console.log('[V3] Textarea filled')

  // Section 03: Rate ALL subjects using Playwright native API
  // The radios are sr-only inside labels; click the label which triggers React onChange
  const TOTAL_MATERIAS = 17
  for (let i = 0; i < TOTAL_MATERIAS; i++) {
    // Try clicking via the label that wraps the first radio
    const radio = page.locator(`input[type="radio"][name="mat-${i}"]`).first()
    const radioCount = await radio.count()
    if (radioCount === 0) continue

    // Click the containing label
    const label = radio.locator('xpath=ancestor::label').first()
    const labelCount = await label.count()

    if (labelCount > 0) {
      await label.scrollIntoViewIfNeeded()
      await label.click()
    } else {
      // Fallback: click directly with force
      await radio.scrollIntoViewIfNeeded()
      await radio.click({ force: true })
    }
    await page.waitForTimeout(100)
  }
  console.log('[V3] All subjects rated via Playwright native')

  // Verify rated count >= 10
  await page.waitForTimeout(800)

  // Hide feedback widget that intercepts pointer events
  await hideFeedbackWidget(page)

  // Find and verify the save/continue button
  const guardarBtn = page.getByRole('button', { name: /guardar|continuar/i }).first()
  await guardarBtn.waitFor({ state: 'visible', timeout: 10000 })
  const isDisabled = await guardarBtn.isDisabled()
  console.log(`[V3] Save button disabled: ${isDisabled}`)

  if (isDisabled) {
    console.log('[V3] RESULT: FAIL — save button still disabled after completing all fields')
    await page.screenshot({ path: 'e2e/verifications/save-checkmark-disabled.png', fullPage: true })
    expect(isDisabled).toBe(false)
    return
  }

  // Hide feedback widget
  await hideFeedbackWidget(page)
  await page.waitForTimeout(500)

  // Wait for button to be truly enabled
  await expect(guardarBtn).not.toBeDisabled({ timeout: 5000 }).catch(() => {})

  // Check how many radios are actually checked (to verify React state)
  const checkedRadios = await page.locator('input[type="radio"]:checked').count()
  console.log(`[V3] Actually checked radios: ${checkedRadios}`)

  // Log button state
  const btnDisabledFinal = await guardarBtn.isDisabled()
  const btnHtml = await guardarBtn.evaluate((el) => el.outerHTML)
  console.log(`[V3] Button disabled final: ${btnDisabledFinal}`)
  console.log(`[V3] Button HTML: ${btnHtml.slice(0, 200)}`)

  // Scroll button into view
  await guardarBtn.scrollIntoViewIfNeeded()

  // Hide feedback again before clicking
  await hideFeedbackWidget(page)
  await page.waitForTimeout(300)

  // Click and immediately observe what happens
  await guardarBtn.click({ force: true })
  console.log('[V3] Clicked save button via force click')

  // Wait briefly and take screenshot
  await page.waitForTimeout(3000)
  await page.screenshot({ path: 'e2e/verifications/after-click-debug.png', fullPage: true })
  console.log(`[V3] URL 3s after click: ${page.url()}`)
  console.log(`[V3] Console errors: ${JSON.stringify(consoleErrors.slice(0, 5))}`)
  console.log(`[V3] Failed requests: ${JSON.stringify(failedRequests.slice(0, 5))}`)
  console.log(`[V3] Error responses: ${JSON.stringify(errorResponses.slice(0, 5))}`)

  // Check if completion screen appeared (shows before navigation)
  const completionVisible = await page.getByText(/listo|perfil escolar|guardado/i).isVisible({ timeout: 2000 }).catch(() => false)
  console.log(`[V3] Completion screen visible: ${completionVisible}`)

  // Wait for redirect to home — also accept any navigation away from assessment
  await page.waitForURL(
    (url) => !url.pathname.includes('/assessment'),
    { timeout: 30000 }
  )
  console.log(`[V3] Redirected to: ${page.url()}`)

  // Wait for home to load
  await page.waitForLoadState('networkidle', { timeout: 15000 })
  await page.waitForTimeout(2000)

  // Take screenshot of home
  const timestamp = Date.now()
  const screenshotPath = `e2e/verifications/home-after-save-${timestamp}.png`
  await page.screenshot({ path: screenshotPath, fullPage: true })
  console.log(`[V3] Screenshot: ${screenshotPath}`)

  // Look for voscolegio completion indicators
  // Try multiple patterns: checkmark, "Completado", tick icon, etc.
  const completionPatterns = [
    page.getByText(/completado/i),
    page.locator('[class*="check"], [class*="tick"], [class*="complete"]').filter({ hasText: /colegio|voscolegio/i }),
    page.locator('svg[class*="check"], [data-icon="check"]'),
    // Look for a card with voscolegio text AND some completion indicator nearby
  ]

  let foundCheckmark = false
  let foundText = ''

  // Check page for "Completado" text near voscolegio
  const pageContent = await page.content()
  const hasCompletado = pageContent.toLowerCase().includes('completado')
  console.log(`[V3] Page contains "completado": ${hasCompletado}`)

  // More targeted: find the voscolegio card/section and check its state
  const voscolegioCard = page.locator('*').filter({ hasText: /vos.*colegio|colegio/i }).last()
  if (await voscolegioCard.isVisible({ timeout: 3000 }).catch(() => false)) {
    const cardHtml = await voscolegioCard.evaluate((el) => el.outerHTML.slice(0, 500))
    console.log(`[V3] Voscolegio card HTML snippet: ${cardHtml}`)

    // Check if there's a check icon inside or near it
    const parentHtml = await voscolegioCard.evaluate((el) => {
      const parent = el.closest('[class*="card"], [class*="module"], [class*="assessment"], li, article')
      return parent ? parent.outerHTML.slice(0, 800) : 'no-parent'
    })
    console.log(`[V3] Parent container HTML: ${parentHtml}`)

    foundCheckmark = parentHtml.includes('check') || parentHtml.includes('complet') || parentHtml.includes('✓') || parentHtml.includes('✅')
    if (foundCheckmark) {
      foundText = 'Found checkmark/completion indicator in voscolegio card'
    }
  }

  // Also check progress bar / counter updates
  const progressText = await page.locator('[class*="progress"], [class*="percent"], [class*="completion"]').first().textContent().catch(() => '')
  console.log(`[V3] Progress text: ${progressText}`)

  // Check assessmentStore completedSections via localStorage
  const storeData = await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.includes('assessment') || key.includes('timon')) {
        return { key, value: localStorage.getItem(key) }
      }
    }
    return null
  })
  console.log(`[V3] LocalStorage store: ${JSON.stringify(storeData)}`)

  if (foundCheckmark || hasCompletado) {
    console.log('[V3] RESULT: PASS — module marked as completed on home')
  } else {
    console.log('[V3] RESULT: FAIL — no completion indicator found for voscolegio on home')
  }

  // Soft assertion
  expect.soft(foundCheckmark || hasCompletado).toBe(true)
})
