import { test, expect } from '@playwright/test'
import { login } from '../helpers/forms'

test('capture exact 23505 error detail on voscolegio save', async ({ page }) => {
  test.setTimeout(120_000)
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))

  await login(page)
  await page.goto('/es/assessment/voscolegio')
  await expect(page).toHaveURL(/voscolegio/, { timeout: 15000 })

  // Slider
  const slider = page.locator('[role="slider"]').first()
  if (await slider.isVisible().catch(() => false)) {
    await slider.focus()
    for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight')
  }

  // Textarea contenido digital
  const ta = page.locator('main textarea').first()
  if (await ta.isVisible({ timeout: 1000 }).catch(() => false)) {
    await ta.fill('Series, podcasts y videos cortos.')
  }

  // Rate >= 10 materias
  const radios = await page.locator('input[type="radio"]').all()
  let rated = 0
  for (const r of radios) {
    if (rated >= 30) break
    if (await r.isVisible().catch(() => false)) {
      try {
        await r.click({ force: true, timeout: 500 })
        rated++
      } catch {}
    }
  }

  // Click save
  const saveBtn = page.getByRole('button', { name: /guardar/i })
  await saveBtn.first().waitFor({ state: 'visible', timeout: 5000 })
  await saveBtn.first().click().catch(() => {})

  // Wait for either success redirect or error
  await page.waitForTimeout(5000)

  // Dump errors
  console.log('=== CAPTURED ERRORS ===')
  errors.forEach((e) => console.log(e))
  console.log('=== URL FINAL ===', page.url())
})
