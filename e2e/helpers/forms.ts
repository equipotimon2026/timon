/**
 * Shared form helpers for assessment E2E tests.
 *
 * These utilities reduce duplication across module specs by providing
 * common interaction patterns for Timon's custom UI components:
 *   - Pill/chip buttons (no native <select> or <radio>, just styled <button>)
 *   - Textarea inputs
 *   - Range sliders (type="range")
 *   - Chat-style flows (bot messages → user clicks a button)
 */

import { type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Login helper (thin wrapper over the existing loginViaUI in auth.ts)
// ---------------------------------------------------------------------------

export const REAL_USER = {
  email: process.env.E2E_TEST_EMAIL ?? 'tomas.monge2704@gmail.com',
  password: process.env.E2E_TEST_PASSWORD ?? '123456',
}

/**
 * Logs in with the real test user and waits for navigation away from /login.
 * The login page is multi-step: first email → API call → then password.
 */
export async function login(page: Page): Promise<void> {
  await page.goto('/es/login')

  // Step 1: fill email and click Continuar
  await page.getByLabel(/correo electronico|email/i).fill(REAL_USER.email)
  await page.getByRole('button', { name: /continuar/i }).click()

  // Step 2: wait for password field to appear (API check-email resolves)
  await page.locator('input[type="password"]').waitFor({ state: 'visible', timeout: 10000 })
  await page.locator('input[type="password"]').fill(REAL_USER.password)
  await page.getByRole('button', { name: /ingresar/i }).click()

  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 20000,
  })
}

// ---------------------------------------------------------------------------
// Pill / chip buttons
// ---------------------------------------------------------------------------

/**
 * Clicks ALL visible pill buttons inside `container` (or the whole page).
 * Useful for chip-selection groups where any selection is valid.
 *
 * NOTE: selector targets the styled round buttons Timon uses — they carry
 * inline `border-radius: 9999px` but no specific data-testid.
 * If the UI adds data-testid in the future, prefer that.
 */
export async function clickAllVisiblePills(
  page: Page,
  container?: string,
): Promise<void> {
  const scope = container ? page.locator(container) : page
  // Timon pills share rounded-full class or inline border-radius; targeting by
  // role=button is the most stable approach.
  const pills = scope.getByRole('button')
  const count = await pills.count()
  for (let i = 0; i < count; i++) {
    const btn = pills.nth(i)
    // Skip hidden, disabled, or navigation buttons
    if (!(await btn.isVisible())) continue
    if (await btn.isDisabled()) continue
    // Skip buttons that look like navigation (contain ← → or "Siguiente", "Anterior")
    const text = (await btn.textContent()) ?? ''
    if (/←|→|anterior|siguiente|continuar|finalizar|guardar|listo|ver.*perfil|guardar.*y|terminar|empezar|volver|cerrar/i.test(text)) continue
    await btn.click().catch(() => {/* ignore if element detaches */})
  }
}

/**
 * Clicks the first option button that matches a given text (partial, case-insensitive).
 * Used for single-select pill groups.
 */
export async function clickPill(page: Page, text: string | RegExp): Promise<void> {
  await page.getByRole('button', { name: text }).first().click()
}

// ---------------------------------------------------------------------------
// Textarea helpers
// ---------------------------------------------------------------------------

/**
 * Fills every visible textarea on the page with `text`.
 */
export async function fillAllTextareas(page: Page, text: string): Promise<void> {
  const areas = page.locator('textarea')
  const count = await areas.count()
  for (let i = 0; i < count; i++) {
    const ta = areas.nth(i)
    if (!(await ta.isVisible())) continue
    await ta.fill(text)
  }
}

/**
 * Fills a single textarea (by index or placeholder) with `text`.
 */
export async function fillTextarea(
  page: Page,
  text: string,
  placeholderOrIndex: string | number = 0,
): Promise<void> {
  if (typeof placeholderOrIndex === 'number') {
    await page.locator('textarea').nth(placeholderOrIndex).fill(text)
  } else {
    await page.getByPlaceholder(placeholderOrIndex).fill(text)
  }
}

// ---------------------------------------------------------------------------
// Slider helpers
// ---------------------------------------------------------------------------

/**
 * Moves every range slider on the page to `value`.
 * The slider is the native <input type="range"> used by Gardner and Voscolegio.
 */
export async function setAllSliders(page: Page, value: number = 3): Promise<void> {
  const sliders = page.locator('input[type="range"]')
  const count = await sliders.count()
  for (let i = 0; i < count; i++) {
    const slider = sliders.nth(i)
    if (!(await slider.isVisible())) continue
    await slider.fill(String(value))
  }
}

// ---------------------------------------------------------------------------
// Chat-flow helpers (MIPS, Proyectivas, Padres, Profesionales)
// ---------------------------------------------------------------------------

/**
 * Waits for a chat-style option button to appear (the bot shows it), then clicks it.
 * `labelPattern` is matched against the button text.
 */
export async function waitAndClickChatOption(
  page: Page,
  labelPattern: string | RegExp,
  timeout = 10000,
): Promise<void> {
  const btn = page.getByRole('button', { name: labelPattern })
  await btn.waitFor({ state: 'visible', timeout })
  await btn.click()
}

/**
 * Submits a textarea-based chat response.
 * Fills `text` into the first visible textarea and clicks the send button.
 */
export async function submitChatText(page: Page, text: string): Promise<void> {
  const ta = page.locator('textarea').first()
  await ta.waitFor({ state: 'visible', timeout: 10000 })
  await ta.fill(text)
  // Send button: round dark button with an arrow SVG — no accessible name,
  // so we use the svg path or closest button sibling.
  // Prefer clicking via keyboard Enter (the form handles it).
  await ta.press('Enter')
}

// ---------------------------------------------------------------------------
// Feedback widget helper
// ---------------------------------------------------------------------------

/**
 * Hides the SectionFeedback widget via a persistent CSS override.
 * Uses a <style> injection so it survives React re-renders.
 * Also removes the current DOM node for immediate effect.
 */
export async function hideFeedbackWidget(page: Page): Promise<void> {
  await page.evaluate(() => {
    // Inject persistent CSS override if not already done
    if (!document.getElementById('__pw-hide-feedback')) {
      const style = document.createElement('style')
      style.id = '__pw-hide-feedback'
      style.textContent = '[data-slot="section-feedback"] { display: none !important; pointer-events: none !important; }'
      document.head.appendChild(style)
    }
    // Also remove current node for immediate effect
    document.querySelector('[data-slot="section-feedback"]')?.remove()
  })
}

// ---------------------------------------------------------------------------
// Section navigation helpers
// ---------------------------------------------------------------------------

/**
 * Clicks "Siguiente →" (or "Continuar →") to advance to the next section/step.
 */
export async function clickNext(page: Page): Promise<void> {
  const btn = page
    .getByRole('button', { name: /siguiente|continuar/i })
    .first()
  await btn.waitFor({ state: 'visible', timeout: 8000 })
  await btn.click()
}

/**
 * Checks whether a button with text matching `pattern` is visible and enabled.
 */
export async function isFinalButtonReady(
  page: Page,
  pattern: RegExp | string,
): Promise<boolean> {
  try {
    const btn = page.getByRole('button', { name: pattern }).first()
    await btn.waitFor({ state: 'visible', timeout: 5000 })
    return !(await btn.isDisabled())
  } catch {
    return false
  }
}
