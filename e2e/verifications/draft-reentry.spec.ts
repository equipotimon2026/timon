/**
 * V5 — FEAT-01: Draft autosave + re-entry
 * Fills voscolegio partially, clears session, re-enters and checks restoration.
 */

import { test, expect, chromium } from '@playwright/test'
import { login } from '../helpers/forms'

test('V5 - FEAT-01: draft autosave and reentry', async ({ browser }) => {
  // === Context 1: Fill and autosave draft ===
  const ctx1 = await browser.newContext()
  const page1 = await ctx1.newPage()

  await login(page1)
  await page1.goto('/es/assessment/voscolegio')
  await expect(page1).toHaveURL(/assessment\/voscolegio/, { timeout: 15000 })

  // Wait for form to load
  await page1.waitForLoadState('networkidle', { timeout: 15000 })

  // Section 01: Slider — set to 7
  const slider = page1.locator('input[type="range"]').first()
  await slider.waitFor({ state: 'visible', timeout: 10000 })
  await slider.fill('7')
  console.log('[V5] Slider filled with 7')

  // Section 02: Textarea
  const ta = page1.locator('textarea').first()
  const taVisible = await ta.isVisible({ timeout: 3000 }).catch(() => false)
  if (taVisible) {
    await ta.fill('Draft test content para e2e autosave verification')
    console.log('[V5] Textarea filled')
  }

  // Rate first 5 subjects (mat-0 to mat-4) for draft
  for (let i = 0; i < 5; i++) {
    const radio = page1.locator(`input[type="radio"][name="mat-${i}"]`).first()
    if (await radio.isVisible({ timeout: 1000 }).catch(() => false)) {
      await radio.click({ force: true })
    }
  }
  console.log('[V5] Rated 5 subjects')

  // Wait for debounce (1000ms) + buffer
  await page1.waitForTimeout(2500)
  console.log('[V5] Waited 2.5s for debounce saveDraft')

  // Intercept saveDraft network call confirmation (server action)
  // Check localStorage or just trust the timing
  await ctx1.close()
  console.log('[V5] Context 1 closed (cookies cleared)')

  // === Context 2: Re-enter and check draft restoration ===
  const ctx2 = await browser.newContext()
  const page2 = await ctx2.newPage()

  await login(page2)
  await page2.goto('/es/assessment/voscolegio')
  await expect(page2).toHaveURL(/assessment\/voscolegio/, { timeout: 15000 })

  // Wait for draft loading
  await page2.waitForLoadState('networkidle', { timeout: 15000 })
  await page2.waitForTimeout(2000)

  // Check slider restoration
  const slider2 = page2.locator('input[type="range"]').first()
  let sliderRestored = false
  if (await slider2.isVisible({ timeout: 5000 }).catch(() => false)) {
    const val = await slider2.inputValue()
    sliderRestored = val === '7'
    console.log(`[V5] Slider value after reentry: ${val} (expected 7) — restored: ${sliderRestored}`)
  }

  // Check textarea restoration
  const ta2 = page2.locator('textarea').first()
  let textareaRestored = false
  if (await ta2.isVisible({ timeout: 3000 }).catch(() => false)) {
    const val = await ta2.inputValue()
    textareaRestored = val.includes('Draft test content')
    console.log(`[V5] Textarea value: "${val.slice(0, 60)}" — restored: ${textareaRestored}`)
  }

  // Check at least one radio restored
  let radioRestored = false
  for (let i = 0; i < 5; i++) {
    const radio = page2.locator(`input[type="radio"][name="mat-${i}"]`).first()
    if (await radio.isVisible({ timeout: 500 }).catch(() => false)) {
      const checked = await radio.isChecked()
      if (checked) { radioRestored = true; break }
    }
  }
  console.log(`[V5] Radio(s) restored: ${radioRestored}`)

  const anyRestored = sliderRestored || textareaRestored || radioRestored
  console.log(`[V5] RESULT: ${anyRestored ? 'PASS' : 'FAIL'} — slider:${sliderRestored} textarea:${textareaRestored} radio:${radioRestored}`)

  await ctx2.close()

  // Soft assertion — at least one field should be restored
  expect.soft(anyRestored).toBe(true)
})
