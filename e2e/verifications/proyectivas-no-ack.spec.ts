/**
 * FEAT-04: Proyectivas (Chatiemos parte 2) — verificar SIN autorespuesta canned
 */
import { test, expect } from '@playwright/test'
import { login } from '../helpers/forms'

test('FEAT-04: Proyectivas — no canned ack between questions', async ({ page }) => {
  test.setTimeout(60_000)
  await login(page)
  await page.goto('/es/assessment/proyectivas')
  await expect(page).toHaveURL(/proyectivas/, { timeout: 15000 })

  // Wait for first textarea
  const ta = page.locator('main textarea').first()
  await ta.waitFor({ state: 'visible', timeout: 30_000 })

  // Fill and submit (Enter or send button)
  await ta.fill('Respuesta de prueba para verificar que no aparece ACK canned.')
  await page.waitForTimeout(200)

  // Submit via send button inside main
  const sendBtn = page.locator('main button').filter({ has: page.locator('svg') }).last()
  await sendBtn.click().catch(() => ta.press('Enter'))

  // Wait 3s for any canned message to appear (we expect NONE)
  await page.waitForTimeout(3000)

  const cannedTexts = [
    'Gracias por compartir',
    'Muy valioso',
    'Qué bueno saberlo',
    'Interesante.',
    'Eso dice mucho',
    'Bueno saberlo',
  ]

  let foundCanned = ''
  for (const t of cannedTexts) {
    const count = await page.getByText(t, { exact: false }).count()
    if (count > 0) {
      foundCanned = t
      break
    }
  }

  console.log('[FEAT-04] Canned ack found:', foundCanned || 'NONE')
  expect(foundCanned).toBe('')
})
