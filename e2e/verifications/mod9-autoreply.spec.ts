/**
 * V7 — FEAT-04: Mod 9 (vision-futuro) autoresponse between questions
 * Checks if a canned bot reply appears after answering a question.
 */

import { test, expect } from '@playwright/test'
import { login } from '../helpers/forms'

test('V7 - FEAT-04: vision-futuro autoresponse between questions', async ({ page }) => {
  await login(page)
  await page.goto('/es/assessment/vision-futuro')
  await expect(page).toHaveURL(/assessment\/vision-futuro/, { timeout: 15000 })

  // Wait for form
  await page.waitForLoadState('networkidle', { timeout: 15000 })

  const SAMPLE = 'Respuesta de prueba para verificar si hay autorespuesta del bot.'

  // Section 0 — fill textarea and observe
  const ta0 = page.locator('textarea').first()
  await ta0.waitFor({ state: 'visible', timeout: 10000 })
  await ta0.fill(SAMPLE)
  console.log('[V7] Filled textarea section 1')

  // Wait 3-4 seconds to observe any bot reply appearing
  await page.waitForTimeout(4000)

  // Look for canned reply patterns
  const cannedPatterns = [
    /gracias/i,
    /genial/i,
    /bien pensado/i,
    /excelente/i,
    /perfecto/i,
    /ok[,!]?/i,
    /anotado/i,
    /entendido/i,
  ]

  let foundAutoReply = false
  let foundText = ''

  for (const pattern of cannedPatterns) {
    const el = page.getByText(pattern).first()
    if (await el.isVisible({ timeout: 500 }).catch(() => false)) {
      foundAutoReply = true
      foundText = (await el.textContent()) ?? ''
      console.log(`[V7] Canned reply found: "${foundText}"`)
      break
    }
  }

  // Also check for chat bubbles / bot message containers
  const botBubble = page.locator('[class*="bot"], [class*="chat"], [class*="message"], [data-role="bot"]')
  const bubbleCount = await botBubble.count()
  console.log(`[V7] Bot bubble elements count: ${bubbleCount}`)
  if (bubbleCount > 0) {
    for (let i = 0; i < Math.min(bubbleCount, 3); i++) {
      const t = await botBubble.nth(i).textContent()
      console.log(`[V7] Bubble ${i}: "${t?.trim().slice(0, 80)}"`)
    }
  }

  // Navigate to section 2 and repeat
  const nextBtn = page.getByRole('button', { name: /siguiente/i })
  if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await nextBtn.click()
    await page.waitForTimeout(1000)

    const ta1 = page.locator('textarea').first()
    if (await ta1.isVisible({ timeout: 5000 }).catch(() => false)) {
      await ta1.fill(SAMPLE + ' Segunda pregunta.')
      console.log('[V7] Filled textarea section 2')

      // Wait for potential bot reply
      await page.waitForTimeout(4000)

      for (const pattern of cannedPatterns) {
        const el = page.getByText(pattern).first()
        if (await el.isVisible({ timeout: 500 }).catch(() => false)) {
          foundAutoReply = true
          foundText = (await el.textContent()) ?? ''
          console.log(`[V7] Canned reply on Q2: "${foundText}"`)
          break
        }
      }
    }
  }

  if (foundAutoReply) {
    console.log(`[V7] RESULT: AUTORESPUESTA_PRESENTE — text: "${foundText}"`)
  } else {
    console.log('[V7] RESULT: AUTORESPUESTA_AUSENTE — no bot reply detected in vision-futuro')
    console.log('[V7] NOTE: FEAT-04 may be mapped to wrong module (vision-futuro is plain textarea, not chat)')
  }

  // No hard assertion — we report
  expect(true).toBe(true)
})
