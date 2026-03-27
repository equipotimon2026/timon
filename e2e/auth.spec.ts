import { test, expect } from '@playwright/test';

// =============================================================================
// AUTH FLOW E2E TESTS
//
// These tests verify that the authentication UI renders correctly and that
// client-side form validation works as expected. Tests that require a live
// Supabase connection (actual sign-up, sign-in, password reset) are marked
// with test.skip() so they don't fail in environments without a backend.
// =============================================================================

test.describe('Register page', () => {
  test('renders the registration form with all expected elements', async ({
    page,
  }) => {
    await page.goto('/es/register');

    // Heading
    await expect(
      page.getByRole('heading', { name: /crear cuenta/i }),
    ).toBeVisible();

    // Email field
    await expect(page.getByLabel(/correo electronico|email/i)).toBeVisible();

    // Password field
    const passwordInputs = page.locator('input[type="password"]');
    await expect(passwordInputs).toHaveCount(2); // password + confirmPassword

    // Submit button
    await expect(
      page.getByRole('button', { name: /registrarse/i }),
    ).toBeVisible();

    // Link to login page
    await expect(
      page.getByRole('link', { name: /inicia sesion/i }),
    ).toBeVisible();
  });

  test('shows validation errors when submitting an empty form', async ({
    page,
  }) => {
    await page.goto('/es/register');

    // Click submit without filling anything
    await page.getByRole('button', { name: /registrarse/i }).click();

    // Expect at least one validation error message to appear
    // The Zod schema requires email + password (min 6) + confirmPassword
    await expect(page.getByText(/email invalido/i)).toBeVisible();
    await expect(page.getByText(/minimo 6 caracteres/i).first()).toBeVisible();
  });

  test('shows mismatch error when passwords do not match', async ({
    page,
  }) => {
    await page.goto('/es/register');

    await page.getByLabel(/correo electronico|email/i).fill('test@example.com');

    // Fill password fields with different values
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('Password1');
    await passwordInputs.nth(1).fill('Different2');

    await page.getByRole('button', { name: /registrarse/i }).click();

    await expect(
      page.getByText(/las contrasenas no coinciden/i),
    ).toBeVisible();
  });

  test('navigates to login page via link', async ({ page }) => {
    await page.goto('/es/register');

    await page.getByRole('link', { name: /inicia sesion/i }).click();

    await expect(page).toHaveURL(/\/es\/login/);
  });

  // -- This test requires a running Supabase instance with email confirmations --
  test.skip('registers a new user and shows success message', async ({
    page,
  }) => {
    await page.goto('/es/register');

    const uniqueEmail = `e2e-${Date.now()}@timon-test.app`;

    await page.getByLabel(/^email$/i).fill(uniqueEmail);
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('TestPassword123!');
    await passwordInputs.nth(1).fill('TestPassword123!');

    await page.getByRole('button', { name: /registrarse/i }).click();

    // After successful registration the page shows a success message
    await expect(
      page.getByRole('heading', { name: /revisa tu email/i }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText(/te enviamos un link de confirmacion/i),
    ).toBeVisible();
  });
});

test.describe('Login page', () => {
  test('renders the login form with all expected elements', async ({
    page,
  }) => {
    await page.goto('/es/login');

    // Heading
    await expect(
      page.getByRole('heading', { name: /iniciar sesion/i }),
    ).toBeVisible();

    // Email field
    await expect(page.getByLabel(/correo electronico|email/i)).toBeVisible();

    // Password field
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Submit button
    await expect(
      page.getByRole('button', { name: /ingresar/i }),
    ).toBeVisible();

    // Links
    await expect(
      page.getByRole('link', { name: /olvidaste tu contrasena/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /registrate/i }),
    ).toBeVisible();
  });

  test('shows validation errors when submitting an empty form', async ({
    page,
  }) => {
    await page.goto('/es/login');

    await page.getByRole('button', { name: /ingresar/i }).click();

    await expect(page.getByText(/email invalido/i)).toBeVisible();
    await expect(page.getByText(/minimo 6 caracteres/i)).toBeVisible();
  });

  test('navigates to register page via link', async ({ page }) => {
    await page.goto('/es/login');

    await page.getByRole('link', { name: /registrate/i }).click();

    await expect(page).toHaveURL(/\/es\/register/);
  });

  test('navigates to forgot password page via link', async ({ page }) => {
    await page.goto('/es/login');

    await page.getByRole('link', { name: /olvidaste tu contrasena/i }).click();

    await expect(page).toHaveURL(/\/es\/forgot-password/);
  });

  // -- Requires Supabase with a pre-existing test user --
  test.skip('logs in with valid credentials and redirects to home', async ({
    page,
  }) => {
    await page.goto('/es/login');

    await page.getByLabel(/correo electronico|email/i).fill('e2e-test@timon.app');
    await page.locator('input[type="password"]').fill('TestPassword123!');
    await page.getByRole('button', { name: /ingresar/i }).click();

    // Should redirect away from login (to the home / onboarding page)
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
  });

  // -- Requires Supabase --
  test.skip('shows an error with invalid credentials', async ({ page }) => {
    await page.goto('/es/login');

    await page.getByLabel(/correo electronico|email/i).fill('nonexistent@timon.app');
    await page.locator('input[type="password"]').fill('WrongPassword!');
    await page.getByRole('button', { name: /ingresar/i }).click();

    // Supabase returns "Invalid login credentials"
    await expect(page.getByText(/invalid login credentials/i)).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe('Forgot password page', () => {
  test('renders the forgot password form correctly', async ({ page }) => {
    await page.goto('/es/forgot-password');

    // Heading
    await expect(
      page.getByRole('heading', { name: /recuperar contrasena/i }),
    ).toBeVisible();

    // Description text
    await expect(
      page.getByText(/ingresa tu email.*link.*restablecer/i),
    ).toBeVisible();

    // Email field
    await expect(page.getByLabel(/correo electronico|email/i)).toBeVisible();

    // Submit button
    await expect(
      page.getByRole('button', { name: /enviar link/i }),
    ).toBeVisible();

    // Back to login link
    await expect(
      page.getByRole('link', { name: /volver a iniciar sesion/i }),
    ).toBeVisible();
  });

  test('shows validation error for empty email', async ({ page }) => {
    await page.goto('/es/forgot-password');

    await page.getByRole('button', { name: /enviar link/i }).click();

    await expect(page.getByText(/email invalido/i)).toBeVisible();
  });

  test('navigates back to login page', async ({ page }) => {
    await page.goto('/es/forgot-password');

    await page
      .getByRole('link', { name: /volver a iniciar sesion/i })
      .click();

    await expect(page).toHaveURL(/\/es\/login/);
  });

  // -- Requires Supabase --
  test.skip('submits email and shows success message', async ({ page }) => {
    await page.goto('/es/forgot-password');

    await page.getByLabel(/correo electronico|email/i).fill('e2e-test@timon.app');
    await page.getByRole('button', { name: /enviar link/i }).click();

    await expect(
      page.getByRole('heading', { name: /email enviado/i }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText(/si el email existe.*link.*restablecer/i),
    ).toBeVisible();
  });
});

test.describe('Auth redirects', () => {
  test('redirects unauthenticated users from home to login', async ({
    page,
  }) => {
    // Attempt to visit the protected home page without being logged in
    await page.goto('/es');

    // The middleware should redirect to /es/login
    await expect(page).toHaveURL(/\/es\/login/, { timeout: 10000 });
  });

  test('redirects unauthenticated users from assessment to login', async ({
    page,
  }) => {
    await page.goto('/es/assessment/mips');

    await expect(page).toHaveURL(/\/es\/login/, { timeout: 10000 });
  });
});

test.describe('Logout flow', () => {
  // -- Requires Supabase with a pre-existing test user --
  test.skip('logs out and redirects to login page', async ({ page }) => {
    // First log in
    await page.goto('/es/login');
    await page.getByLabel(/correo electronico|email/i).fill('e2e-test@timon.app');
    await page.locator('input[type="password"]').fill('TestPassword123!');
    await page.getByRole('button', { name: /ingresar/i }).click();

    // Wait for the app to load (either onboarding or category selection)
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

    // Open user dropdown menu and click "Cerrar sesion"
    await page.getByRole('button').filter({ has: page.locator('svg') }).last().click();
    await page.getByText(/cerrar sesion/i).click();

    // Should be redirected to login
    await expect(page).toHaveURL(/\/es\/login/, { timeout: 10000 });
  });
});

test.describe('i18n - English locale', () => {
  test('login page loads with English locale URL', async ({ page }) => {
    await page.goto('/en/login');

    // The page should load under the /en/ locale.
    // Since the app uses defaultValue fallbacks in Spanish, the actual text
    // shown depends on whether en.json has auth translations. We verify
    // the page at least renders the form structure.
    await expect(page.getByLabel(/correo electronico|email/i)).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /ingresar|log\s?in|submit/i })).toBeVisible();
  });

  test('register page loads with English locale URL', async ({ page }) => {
    await page.goto('/en/register');

    await expect(page.getByLabel(/correo electronico|email/i)).toBeVisible();
    // Two password fields (password + confirm)
    await expect(page.locator('input[type="password"]')).toHaveCount(2);
  });
});
