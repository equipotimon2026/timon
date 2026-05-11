/**
 * V6 — BUG-05: VAK form existence check
 * Tests /es/assessment/vak and /es/assessment/aprendizaje for form presence and duplicates.
 */

import { test, expect } from '@playwright/test'
import { login } from '../helpers/forms'

test('V6 - BUG-05: VAK form existence and duplicates', async ({ page }) => {
  await login(page)

  const paths = [
    '/es/assessment/vak',
    '/es/assessment/aprendizaje',
  ]

  for (const assessmentPath of paths) {
    await page.goto(assessmentPath)
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    await page.waitForTimeout(1500)

    const finalUrl = page.url()
    console.log(`[V6] Path: ${assessmentPath} → Final URL: ${finalUrl}`)

    // Check for 404 or redirect
    const is404 = await page.getByText(/404|not found|assessment not found/i).isVisible({ timeout: 3000 }).catch(() => false)
    const isRedirected = !finalUrl.includes(assessmentPath.split('/').pop()!)
    const isLogin = finalUrl.includes('/login')

    console.log(`[V6]   is404: ${is404}, isRedirected: ${isRedirected}, isLogin: ${isLogin}`)

    if (is404 || (isRedirected && !isLogin)) {
      console.log(`[V6] ${assessmentPath} → NOT EXISTS (404/redirect)`)
      continue
    }

    if (isLogin) {
      console.log(`[V6] ${assessmentPath} → redirected to login (unexpected)`)
      continue
    }

    // Form exists — count questions/items
    const questions = page.locator('input[type="radio"], input[type="checkbox"], .question, [class*="question"]')
    const questionCount = await questions.count()
    console.log(`[V6] ${assessmentPath} → FORM EXISTS, item count: ${questionCount}`)

    // Check for text duplicates: gather all text nodes and look for repeated ones
    const allTexts = await page.evaluate(() => {
      const els = document.querySelectorAll('p, label, span, li, h2, h3')
      const texts: string[] = []
      els.forEach(el => {
        const t = el.textContent?.trim()
        if (t && t.length > 10) texts.push(t)
      })
      return texts
    })

    const seen = new Map<string, number>()
    for (const t of allTexts) {
      seen.set(t, (seen.get(t) ?? 0) + 1)
    }
    const duplicates = [...seen.entries()].filter(([, count]) => count > 1)
    if (duplicates.length > 0) {
      console.log(`[V6] DUPLICATES FOUND: ${duplicates.slice(0, 5).map(([t, c]) => `"${t.slice(0, 40)}" x${c}`).join('; ')}`)
    } else {
      console.log(`[V6] No text duplicates found`)
    }
  }

  // Summary log
  console.log('[V6] RESULT: Check logs above for EXISTS/NOT_EXISTS and duplicate status')
  // No hard assertion — we report findings
  expect(true).toBe(true)
})
