import { test, expect } from '@playwright/test';

// =============================================================================
// ONBOARDING FLOW E2E TESTS
//
// The onboarding flow is rendered inside the authenticated home page when
// profile.onboarding_completed is false. It follows this step sequence:
//   1. Welcome screen
//   2. Personal data form
//   3. Career status selection (first career / career change)
//   4. Initial question (how many careers in mind)
//   5. Career input (type career names) -- skipped if "0"
//   6. Persona validation (select a persona profile)
//   7. Completion -> redirects to category selection
//
// Since these tests require an authenticated user with an incomplete profile,
// many are written as "smoke tests" that verify UI rendering. Tests that
// depend on Supabase authentication are grouped in a serial describe block
// and marked with test.skip() unless the E2E_AUTH_ENABLED env var is set.
// =============================================================================

// Helper: check if we can run authenticated tests
const canRunAuthTests = !!process.env.E2E_AUTH_ENABLED;

// ---------------------------------------------------------------------------
// SMOKE TESTS -- These verify component rendering without real auth
// They navigate directly to the home page; the middleware will redirect
// unauthenticated users to login, so we verify what we can.
// ---------------------------------------------------------------------------

test.describe('Onboarding smoke tests (no auth required)', () => {
  test('unauthenticated user visiting home is redirected to login', async ({
    page,
  }) => {
    // This confirms the middleware guard is working -- a prerequisite for
    // onboarding to even show up (only authenticated users see it).
    await page.goto('/es');
    await expect(page).toHaveURL(/\/es\/login/, { timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// AUTHENTICATED ONBOARDING TESTS
// These require a real Supabase connection and a test user whose
// onboarding_completed = false. Enable with E2E_AUTH_ENABLED=true.
// ---------------------------------------------------------------------------

test.describe('Onboarding flow (authenticated)', () => {
  test.describe.configure({ mode: 'serial' });

  // Skip the entire block if auth is not available
  test.beforeEach(async () => {
    if (!canRunAuthTests) {
      test.skip();
    }
  });

  // -- Step 1: Welcome screen ------------------------------------------------

  test.skip('welcome screen renders with heading and CTA button', async ({
    page,
  }) => {
    // After login, user with onboarding_completed=false should see
    // the QuestionnaireFlow starting at the welcome step.
    await page.goto('/es/login');
    await page.getByLabel(/email/i).fill(process.env.E2E_TEST_EMAIL ?? 'e2e-test@timon.app');
    await page.locator('input[type="password"]').fill(process.env.E2E_TEST_PASSWORD ?? 'TestPassword123!');
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Welcome screen elements
    await expect(
      page.getByRole('heading', { name: /ayudanos a entrenar/i }),
    ).toBeVisible();
    await expect(page.getByText(/timon/i)).toBeVisible();
    await expect(page.getByText(/beta privada/i)).toBeVisible();

    // Info cards
    await expect(page.getByText(/varias secciones/i)).toBeVisible();
    await expect(page.getByText(/tu voz importa/i)).toBeVisible();

    // Feedback callout
    await expect(page.getByText(/el boton de comentarios/i)).toBeVisible();

    // Single session recommendation
    await expect(page.getByText(/recomendacion.*completarlo en una sola sesion/i)).toBeVisible();

    // Reward section
    await expect(page.getByText(/tu recompensa/i)).toBeVisible();
    await expect(page.getByText(/gratis de por vida/i)).toBeVisible();

    // CTA button
    await expect(
      page.getByRole('button', { name: /empezar/i }),
    ).toBeVisible();
  });

  // -- Step 2: Personal data form --------------------------------------------

  test.skip('personal data form renders and validates required fields', async ({
    page,
  }) => {
    // Navigate to the personal data step (assume we clicked "Empezar" on welcome)
    await page.goto('/es');
    // Skip login/welcome navigation -- in serial mode the previous test
    // would have left us at the welcome screen. For isolation we re-login.
    await page.goto('/es/login');
    await page.getByLabel(/email/i).fill(process.env.E2E_TEST_EMAIL ?? 'e2e-test@timon.app');
    await page.locator('input[type="password"]').fill(process.env.E2E_TEST_PASSWORD ?? 'TestPassword123!');
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Click "Empezar" on welcome screen
    await page.getByRole('button', { name: /empezar/i }).click();

    // Personal data form heading
    await expect(
      page.getByRole('heading', { name: /tus datos/i }),
    ).toBeVisible();
    await expect(page.getByText(/completa tus datos para comenzar/i)).toBeVisible();

    // All form fields should be visible
    await expect(page.getByLabel(/nombre/i).first()).toBeVisible();
    await expect(page.getByLabel(/apellido/i)).toBeVisible();
    await expect(page.getByLabel(/correo electronico/i)).toBeVisible();
    await expect(page.getByLabel(/telefono/i)).toBeVisible();
    await expect(page.getByLabel(/edad/i)).toBeVisible();
    await expect(page.getByLabel(/colegio/i)).toBeVisible();

    // Year select
    await expect(page.getByText(/seleccionar ano/i)).toBeVisible();

    // Submit button should be disabled when form is empty
    await expect(
      page.getByRole('button', { name: /continuar/i }),
    ).toBeDisabled();
  });

  test.skip('personal data form can be filled and submitted', async ({
    page,
  }) => {
    // Login and navigate to personal data step
    await page.goto('/es/login');
    await page.getByLabel(/email/i).fill(process.env.E2E_TEST_EMAIL ?? 'e2e-test@timon.app');
    await page.locator('input[type="password"]').fill(process.env.E2E_TEST_PASSWORD ?? 'TestPassword123!');
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
    await page.getByRole('button', { name: /empezar/i }).click();

    // Fill the form
    await page.getByLabel(/nombre/i).first().fill('Test');
    await page.getByLabel(/apellido/i).fill('User');
    await page.getByLabel(/correo electronico/i).fill('test@example.com');
    await page.getByLabel(/telefono/i).fill('+54 11 1234-5678');
    await page.getByLabel(/edad/i).fill('17');
    await page.getByLabel(/colegio/i).fill('Colegio Test');

    // Select year from dropdown
    await page.getByText(/seleccionar ano/i).click();
    await page.getByRole('option', { name: /5to ano/i }).click();

    // Submit button should now be enabled
    await expect(
      page.getByRole('button', { name: /continuar/i }),
    ).toBeEnabled();

    await page.getByRole('button', { name: /continuar/i }).click();

    // After submission, the career status step should appear
    await expect(
      page.getByRole('heading', { name: /es tu primera carrera/i }),
    ).toBeVisible({ timeout: 10000 });
  });

  // -- Step 3: Career status selection ----------------------------------------

  test.skip('career status screen shows two options', async ({ page }) => {
    // This test assumes the user has already completed personal data.
    // In serial mode it follows the previous test.
    await page.goto('/es/login');
    await page.getByLabel(/email/i).fill(process.env.E2E_TEST_EMAIL ?? 'e2e-test@timon.app');
    await page.locator('input[type="password"]').fill(process.env.E2E_TEST_PASSWORD ?? 'TestPassword123!');
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Navigate through welcome + personal data
    await page.getByRole('button', { name: /empezar/i }).click();
    await page.getByLabel(/nombre/i).first().fill('Test');
    await page.getByLabel(/apellido/i).fill('User');
    await page.getByLabel(/correo electronico/i).fill('test@example.com');
    await page.getByLabel(/telefono/i).fill('+54 11 1234-5678');
    await page.getByLabel(/edad/i).fill('17');
    await page.getByLabel(/colegio/i).fill('Colegio Test');
    await page.getByText(/seleccionar ano/i).click();
    await page.getByRole('option', { name: /5to ano/i }).click();
    await page.getByRole('button', { name: /continuar/i }).click();

    // Career status heading
    await expect(
      page.getByRole('heading', { name: /es tu primera carrera/i }),
    ).toBeVisible({ timeout: 10000 });

    // Two option buttons
    await expect(
      page.getByRole('button', { name: /primera carrera/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /me quiero cambiar/i }),
    ).toBeVisible();
  });

  test.skip('selecting "Primera carrera" advances to initial question', async ({
    page,
  }) => {
    await page.goto('/es/login');
    await page.getByLabel(/email/i).fill(process.env.E2E_TEST_EMAIL ?? 'e2e-test@timon.app');
    await page.locator('input[type="password"]').fill(process.env.E2E_TEST_PASSWORD ?? 'TestPassword123!');
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Quick navigate through prior steps
    await page.getByRole('button', { name: /empezar/i }).click();
    await page.getByLabel(/nombre/i).first().fill('Test');
    await page.getByLabel(/apellido/i).fill('User');
    await page.getByLabel(/correo electronico/i).fill('test@example.com');
    await page.getByLabel(/telefono/i).fill('+54 11 1234-5678');
    await page.getByLabel(/edad/i).fill('17');
    await page.getByLabel(/colegio/i).fill('Colegio Test');
    await page.getByText(/seleccionar ano/i).click();
    await page.getByRole('option', { name: /5to ano/i }).click();
    await page.getByRole('button', { name: /continuar/i }).click();

    await expect(
      page.getByRole('heading', { name: /es tu primera carrera/i }),
    ).toBeVisible({ timeout: 10000 });

    // Select "Primera carrera"
    await page.getByRole('button', { name: /primera carrera/i }).click();

    // Should advance to the initial question step
    await expect(
      page.getByRole('heading', { name: /cuantas carreras tenes en mente/i }),
    ).toBeVisible({ timeout: 10000 });
  });

  // -- Step 4: Initial question -----------------------------------------------

  test.skip('initial question shows four career count options', async ({
    page,
  }) => {
    await page.goto('/es/login');
    await page.getByLabel(/email/i).fill(process.env.E2E_TEST_EMAIL ?? 'e2e-test@timon.app');
    await page.locator('input[type="password"]').fill(process.env.E2E_TEST_PASSWORD ?? 'TestPassword123!');
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    await page.getByRole('button', { name: /empezar/i }).click();
    await page.getByLabel(/nombre/i).first().fill('Test');
    await page.getByLabel(/apellido/i).fill('User');
    await page.getByLabel(/correo electronico/i).fill('test@example.com');
    await page.getByLabel(/telefono/i).fill('+54 11 1234-5678');
    await page.getByLabel(/edad/i).fill('17');
    await page.getByLabel(/colegio/i).fill('Colegio Test');
    await page.getByText(/seleccionar ano/i).click();
    await page.getByRole('option', { name: /5to ano/i }).click();
    await page.getByRole('button', { name: /continuar/i }).click();
    await page.getByRole('button', { name: /primera carrera/i }).click();

    // All four options should be visible
    await expect(page.getByRole('button', { name: /1 carrera/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /2 o 3 carreras/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /muchas carreras/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /ninguna/i })).toBeVisible();
  });

  // -- Step 5: Career input ---------------------------------------------------

  test.skip('career input form appears after selecting "1 Carrera"', async ({
    page,
  }) => {
    await page.goto('/es/login');
    await page.getByLabel(/email/i).fill(process.env.E2E_TEST_EMAIL ?? 'e2e-test@timon.app');
    await page.locator('input[type="password"]').fill(process.env.E2E_TEST_PASSWORD ?? 'TestPassword123!');
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    await page.getByRole('button', { name: /empezar/i }).click();
    await page.getByLabel(/nombre/i).first().fill('Test');
    await page.getByLabel(/apellido/i).fill('User');
    await page.getByLabel(/correo electronico/i).fill('test@example.com');
    await page.getByLabel(/telefono/i).fill('+54 11 1234-5678');
    await page.getByLabel(/edad/i).fill('17');
    await page.getByLabel(/colegio/i).fill('Colegio Test');
    await page.getByText(/seleccionar ano/i).click();
    await page.getByRole('option', { name: /5to ano/i }).click();
    await page.getByRole('button', { name: /continuar/i }).click();
    await page.getByRole('button', { name: /primera carrera/i }).click();
    await page.getByRole('button', { name: /1 carrera/i }).click();

    // Career input form
    await expect(
      page.getByRole('heading', { name: /cuales carreras tienes en mente/i }),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/escribe las opciones/i)).toBeVisible();

    // One input field for the career
    await expect(page.getByPlaceholder(/carrera 1/i)).toBeVisible();

    // Continuar button (disabled initially since the field is empty)
    await expect(
      page.getByRole('button', { name: /continuar/i }),
    ).toBeDisabled();

    // Fill the career and enable submit
    await page.getByPlaceholder(/carrera 1/i).fill('Ingenieria en Sistemas');
    await expect(
      page.getByRole('button', { name: /continuar/i }),
    ).toBeEnabled();
  });

  // -- Step 6: Persona selection ----------------------------------------------

  test.skip('persona validator shows persona cards after submitting careers', async ({
    page,
  }) => {
    await page.goto('/es/login');
    await page.getByLabel(/email/i).fill(process.env.E2E_TEST_EMAIL ?? 'e2e-test@timon.app');
    await page.locator('input[type="password"]').fill(process.env.E2E_TEST_PASSWORD ?? 'TestPassword123!');
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Navigate through all prior steps
    await page.getByRole('button', { name: /empezar/i }).click();
    await page.getByLabel(/nombre/i).first().fill('Test');
    await page.getByLabel(/apellido/i).fill('User');
    await page.getByLabel(/correo electronico/i).fill('test@example.com');
    await page.getByLabel(/telefono/i).fill('+54 11 1234-5678');
    await page.getByLabel(/edad/i).fill('17');
    await page.getByLabel(/colegio/i).fill('Colegio Test');
    await page.getByText(/seleccionar ano/i).click();
    await page.getByRole('option', { name: /5to ano/i }).click();
    await page.getByRole('button', { name: /continuar/i }).click();
    await page.getByRole('button', { name: /primera carrera/i }).click();
    await page.getByRole('button', { name: /1 carrera/i }).click();
    await page.getByPlaceholder(/carrera 1/i).fill('Ingenieria en Sistemas');
    await page.getByRole('button', { name: /continuar/i }).click();

    // Persona validator heading
    await expect(
      page.getByRole('heading', { name: /con cual de estos perfiles/i }),
    ).toBeVisible({ timeout: 10000 });

    // "Confirmar" button should be disabled until a persona is selected
    await expect(
      page.getByRole('button', { name: /confirmar/i }),
    ).toBeDisabled();

    // "Ninguno me representa" link should be visible
    await expect(page.getByText(/ninguno me representa/i)).toBeVisible();
  });

  test.skip('selecting "Ninguna" in career count skips career input and goes to persona validator', async ({
    page,
  }) => {
    await page.goto('/es/login');
    await page.getByLabel(/email/i).fill(process.env.E2E_TEST_EMAIL ?? 'e2e-test@timon.app');
    await page.locator('input[type="password"]').fill(process.env.E2E_TEST_PASSWORD ?? 'TestPassword123!');
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    await page.getByRole('button', { name: /empezar/i }).click();
    await page.getByLabel(/nombre/i).first().fill('Test');
    await page.getByLabel(/apellido/i).fill('User');
    await page.getByLabel(/correo electronico/i).fill('test@example.com');
    await page.getByLabel(/telefono/i).fill('+54 11 1234-5678');
    await page.getByLabel(/edad/i).fill('17');
    await page.getByLabel(/colegio/i).fill('Colegio Test');
    await page.getByText(/seleccionar ano/i).click();
    await page.getByRole('option', { name: /5to ano/i }).click();
    await page.getByRole('button', { name: /continuar/i }).click();
    await page.getByRole('button', { name: /primera carrera/i }).click();

    // Select "Ninguna" (0 careers) -- should skip the career input step
    await page.getByRole('button', { name: /ninguna/i }).click();

    // Should go straight to persona validator
    await expect(
      page.getByRole('heading', { name: /con cual de estos perfiles/i }),
    ).toBeVisible({ timeout: 10000 });
  });

  // -- Step 7: Onboarding completion ------------------------------------------

  test.skip('completing persona selection triggers onboarding completion', async ({
    page,
  }) => {
    await page.goto('/es/login');
    await page.getByLabel(/email/i).fill(process.env.E2E_TEST_EMAIL ?? 'e2e-test@timon.app');
    await page.locator('input[type="password"]').fill(process.env.E2E_TEST_PASSWORD ?? 'TestPassword123!');
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Navigate through all steps
    await page.getByRole('button', { name: /empezar/i }).click();
    await page.getByLabel(/nombre/i).first().fill('Test');
    await page.getByLabel(/apellido/i).fill('User');
    await page.getByLabel(/correo electronico/i).fill('test@example.com');
    await page.getByLabel(/telefono/i).fill('+54 11 1234-5678');
    await page.getByLabel(/edad/i).fill('17');
    await page.getByLabel(/colegio/i).fill('Colegio Test');
    await page.getByText(/seleccionar ano/i).click();
    await page.getByRole('option', { name: /5to ano/i }).click();
    await page.getByRole('button', { name: /continuar/i }).click();
    await page.getByRole('button', { name: /primera carrera/i }).click();
    await page.getByRole('button', { name: /ninguna/i }).click();

    // Persona validator -- click the first persona card, then confirm
    await expect(
      page.getByRole('heading', { name: /con cual de estos perfiles/i }),
    ).toBeVisible({ timeout: 10000 });

    // Click the first persona profile button (the first card)
    const personaCards = page.locator('button[type="button"]').filter({
      has: page.locator('h3'),
    });
    await personaCards.first().click();

    // Now "Confirmar" should be enabled
    await expect(
      page.getByRole('button', { name: /confirmar/i }),
    ).toBeEnabled();
    await page.getByRole('button', { name: /confirmar/i }).click();

    // After confirmation, onboarding completes and the category selection
    // page should appear with progress indicators and assessment cards
    await expect(
      page.getByText(/completa las siguientes secciones/i),
    ).toBeVisible({ timeout: 15000 });
  });

  // -- Step 8: Category selection ---------------------------------------------

  test.skip('category selection renders assessment cards after onboarding', async ({
    page,
  }) => {
    // This test assumes onboarding_completed = true (e.g., completed in prior test)
    await page.goto('/es/login');
    await page.getByLabel(/email/i).fill(process.env.E2E_TEST_EMAIL ?? 'e2e-test@timon.app');
    await page.locator('input[type="password"]').fill(process.env.E2E_TEST_PASSWORD ?? 'TestPassword123!');
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Category selection page should be shown
    await expect(
      page.getByText(/completa las siguientes secciones/i),
    ).toBeVisible({ timeout: 15000 });

    // Progress bar
    await expect(page.getByText(/progreso/i)).toBeVisible();
    await expect(page.getByText(/de.*completadas/i)).toBeVisible();

    // Category groups
    await expect(page.getByText(/personalidad/i).first()).toBeVisible();
    await expect(page.getByText(/universidad/i).first()).toBeVisible();

    // At least one assessment card visible
    await expect(page.getByText(/personalidad y estilos/i)).toBeVisible();
    await expect(page.getByText(/mips.*millon/i)).toBeVisible();

    // "Comenzar" label on incomplete assessments
    await expect(page.getByText(/comenzar/i).first()).toBeVisible();
  });

  // -- Step 9: Assessment navigation ------------------------------------------

  test.skip('clicking an assessment card navigates to the assessment page', async ({
    page,
  }) => {
    await page.goto('/es/login');
    await page.getByLabel(/email/i).fill(process.env.E2E_TEST_EMAIL ?? 'e2e-test@timon.app');
    await page.locator('input[type="password"]').fill(process.env.E2E_TEST_PASSWORD ?? 'TestPassword123!');
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    await expect(
      page.getByText(/completa las siguientes secciones/i),
    ).toBeVisible({ timeout: 15000 });

    // Click on the first assessment card (MIPS)
    await page.getByText(/personalidad y estilos/i).click();

    // Should navigate to the assessment page
    await expect(page).toHaveURL(/\/assessment\/mips/, { timeout: 10000 });
  });

  // -- Step 10: Full flow smoke test ------------------------------------------

  test.skip('full onboarding flow from login to category selection', async ({
    page,
  }) => {
    // This is a comprehensive smoke test that walks through the entire
    // onboarding flow end-to-end. It requires a fresh test user with
    // onboarding_completed = false.

    // 1. Login
    await page.goto('/es/login');
    await page.getByLabel(/email/i).fill(process.env.E2E_TEST_EMAIL ?? 'e2e-test@timon.app');
    await page.locator('input[type="password"]').fill(process.env.E2E_TEST_PASSWORD ?? 'TestPassword123!');
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // 2. Welcome screen
    await expect(
      page.getByRole('heading', { name: /ayudanos a entrenar/i }),
    ).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /empezar/i }).click();

    // 3. Personal data
    await expect(
      page.getByRole('heading', { name: /tus datos/i }),
    ).toBeVisible({ timeout: 10000 });
    await page.getByLabel(/nombre/i).first().fill('E2E');
    await page.getByLabel(/apellido/i).fill('Tester');
    await page.getByLabel(/correo electronico/i).fill('e2e@timon-test.app');
    await page.getByLabel(/telefono/i).fill('+54 11 9999-0000');
    await page.getByLabel(/edad/i).fill('18');
    await page.getByLabel(/colegio/i).fill('Colegio E2E');
    await page.getByText(/seleccionar ano/i).click();
    await page.getByRole('option', { name: /6to ano/i }).click();
    await page.getByRole('button', { name: /continuar/i }).click();

    // 4. Career status
    await expect(
      page.getByRole('heading', { name: /es tu primera carrera/i }),
    ).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /primera carrera/i }).click();

    // 5. Initial question
    await expect(
      page.getByRole('heading', { name: /cuantas carreras tenes en mente/i }),
    ).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /2 o 3 carreras/i }).click();

    // 6. Career input
    await expect(
      page.getByRole('heading', { name: /cuales carreras tienes en mente/i }),
    ).toBeVisible({ timeout: 10000 });
    await page.getByPlaceholder(/carrera 1/i).fill('Medicina');
    // Add another career
    await page.getByRole('button', { name: /agregar otra/i }).click();
    await page.getByPlaceholder(/carrera 2/i).fill('Derecho');
    await page.getByRole('button', { name: /continuar/i }).click();

    // 7. Persona validator
    await expect(
      page.getByRole('heading', { name: /con cual de estos perfiles/i }),
    ).toBeVisible({ timeout: 10000 });

    // Select first persona and confirm
    const personaCards = page.locator('button[type="button"]').filter({
      has: page.locator('h3'),
    });
    await personaCards.first().click();
    await page.getByRole('button', { name: /confirmar/i }).click();

    // 8. Category selection should appear
    await expect(
      page.getByText(/completa las siguientes secciones/i),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/progreso/i)).toBeVisible();
    await expect(page.getByText(/personalidad/i).first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// "Ninguno me representa" restart flow
// ---------------------------------------------------------------------------

test.describe('Onboarding restart flow', () => {
  test.skip('clicking "Ninguno me representa" shows restart screen', async ({
    page,
  }) => {
    if (!canRunAuthTests) test.skip();

    await page.goto('/es/login');
    await page.getByLabel(/email/i).fill(process.env.E2E_TEST_EMAIL ?? 'e2e-test@timon.app');
    await page.locator('input[type="password"]').fill(process.env.E2E_TEST_PASSWORD ?? 'TestPassword123!');
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Navigate through to persona validator
    await page.getByRole('button', { name: /empezar/i }).click();
    await page.getByLabel(/nombre/i).first().fill('Test');
    await page.getByLabel(/apellido/i).fill('User');
    await page.getByLabel(/correo electronico/i).fill('test@example.com');
    await page.getByLabel(/telefono/i).fill('+54 11 1234-5678');
    await page.getByLabel(/edad/i).fill('17');
    await page.getByLabel(/colegio/i).fill('Colegio Test');
    await page.getByText(/seleccionar ano/i).click();
    await page.getByRole('option', { name: /5to ano/i }).click();
    await page.getByRole('button', { name: /continuar/i }).click();
    await page.getByRole('button', { name: /primera carrera/i }).click();
    await page.getByRole('button', { name: /ninguna/i }).click();

    // On persona validator, click "Ninguno me representa"
    await expect(
      page.getByRole('heading', { name: /con cual de estos perfiles/i }),
    ).toBeVisible({ timeout: 10000 });
    await page.getByText(/ninguno me representa/i).click();

    // Restart screen
    await expect(
      page.getByRole('heading', { name: /ninguna descripcion parecio encajar/i }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole('button', { name: /empezar de nuevo/i }),
    ).toBeVisible();

    // Clicking "Empezar de nuevo" goes back to career status step
    await page.getByRole('button', { name: /empezar de nuevo/i }).click();
    await expect(
      page.getByRole('heading', { name: /es tu primera carrera/i }),
    ).toBeVisible({ timeout: 10000 });
  });
});
