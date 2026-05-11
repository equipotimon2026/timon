/**
 * V1 — BUG-01: Signup regression check
 * Verifies whether signup succeeds, shows error, or redirects correctly.
 */

import { test, expect } from '@playwright/test'
import * as path from 'path'

test('V1 - BUG-01: signup flow', async ({ page }) => {
  const timestamp = Date.now()
  const email = `signup-${timestamp}@timon-test.app`
  const password = 'Test1234!Secure'

  await page.goto('/es/register')
  await expect(page).toHaveURL(/register/, { timeout: 15000 })

  // Fill firstName
  await page.locator('#firstName').fill('Test')
  // Fill lastName
  await page.locator('#lastName').fill('User')
  // Fill email
  await page.locator('#email').fill(email)
  // Fill password
  await page.locator('#password').fill(password)
  // Fill confirmPassword
  await page.locator('#confirmPassword').fill(password)

  // Set up response listener before clicking
  let apiStatus = -1
  let apiBody: any = {}
  page.on('response', async (resp) => {
    if (resp.url().includes('/api/auth/register')) {
      apiStatus = resp.status()
      try { apiBody = await resp.json() } catch { /* ignore */ }
    }
  })

  await page.getByRole('button', { name: /crear mi cuenta|registrarse|crear cuenta/i }).click()

  // Wait for either success UI, error UI, or redirect (up to 20s)
  await page.waitForTimeout(8000)

  console.log(`[V1] API status: ${apiStatus}`)
  console.log(`[V1] API body: ${JSON.stringify(apiBody)}`)

  // Take screenshot of current state
  const screenshotPath = path.join('e2e/verifications', `signup-${timestamp}.png`)
  await page.screenshot({ path: screenshotPath, fullPage: true })
  console.log(`[V1] Screenshot: ${screenshotPath}`)

  // Check for error message on page
  const errorEl = page.locator('.text-destructive, [class*="destructive"]')
  const errorCount = await errorEl.count()
  let errorText = ''
  for (let i = 0; i < errorCount; i++) {
    const t = await errorEl.nth(i).textContent()
    if (t && t.trim()) errorText += t.trim() + ' | '
  }
  console.log(`[V1] Error text visible: ${errorText || 'NONE'}`)

  // Check final URL
  const finalUrl = page.url()
  console.log(`[V1] Final URL: ${finalUrl}`)

  // Check for success state (needsConfirmation UI)
  const successVisible = await page.getByText(/revisa tu email/i).isVisible().catch(() => false)
  const checkEmailVisible = await page.getByText(/enviamos un link/i).isVisible().catch(() => false)
  console.log(`[V1] Success UI visible: ${successVisible || checkEmailVisible}`)

  // Assertions for report
  if (apiStatus === 200 || apiStatus === 201) {
    if (successVisible || checkEmailVisible) {
      console.log('[V1] RESULT: SUCCESS — shows check-email UI (needsConfirmation)')
    } else if (finalUrl.includes('/es') && !finalUrl.includes('register')) {
      console.log('[V1] RESULT: SUCCESS — redirected away from register (session created)')
    } else {
      console.log('[V1] RESULT: PARTIAL — API ok but UI unclear')
    }
  } else {
    console.log(`[V1] RESULT: FAIL — API returned ${apiStatus}: ${apiBody.error ?? JSON.stringify(apiBody)}`)
  }

  // Soft assert: no "database error" in error text
  expect.soft(errorText).not.toMatch(/database error/i)
  // The page should not still show the register form with a database error
  expect.soft(await page.getByText(/database error saving new user/i).isVisible().catch(() => false)).toBe(false)
})
