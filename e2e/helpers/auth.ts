import { type Page, type BrowserContext } from '@playwright/test';

/**
 * Test user credentials used across E2E tests.
 * In a real CI environment these would come from environment variables
 * pointing to a dedicated Supabase test project.
 */
export const TEST_USER = {
  email: process.env.E2E_TEST_EMAIL ?? 'e2e-test@timon.app',
  password: process.env.E2E_TEST_PASSWORD ?? 'TestPassword123!',
};

/**
 * Supabase project details for admin operations.
 * These are only needed when creating/cleaning up test users via the Admin API.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

// ---------------------------------------------------------------------------
// Login helper -- fills the login form and submits
// ---------------------------------------------------------------------------

/**
 * Performs a full login through the UI.
 * Use this when you need an authenticated session for subsequent tests.
 *
 * @param page  - Playwright Page object
 * @param email - User email (defaults to TEST_USER.email)
 * @param password - User password (defaults to TEST_USER.password)
 */
export async function loginViaUI(
  page: Page,
  email = TEST_USER.email,
  password = TEST_USER.password,
) {
  await page.goto('/es/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/contrasena|password/i).fill(password);
  await page.getByRole('button', { name: /ingresar|submit/i }).click();

  // Wait for navigation away from the login page
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 15000,
  });
}

// ---------------------------------------------------------------------------
// Storage-state helper -- saves cookies/localStorage for reuse
// ---------------------------------------------------------------------------

/**
 * Logs in and saves the browser storage state to a file so that
 * subsequent tests can skip the login step entirely.
 *
 * Usage in playwright.config.ts:
 *   storageState: './e2e/.auth/user.json'
 *
 * @param page    - Playwright Page object
 * @param context - Playwright BrowserContext
 * @param path    - File path to save the storage state (default: ./e2e/.auth/user.json)
 */
export async function saveAuthState(
  page: Page,
  context: BrowserContext,
  path = './e2e/.auth/user.json',
) {
  await loginViaUI(page);
  await context.storageState({ path });
}

// ---------------------------------------------------------------------------
// Supabase Admin helpers -- create / delete test users
// ---------------------------------------------------------------------------

/**
 * Creates a test user in Supabase using the Admin API (service role key).
 * Skips creation if the required environment variables are not set.
 *
 * @returns The created user object, or null if env vars are missing.
 */
export async function createTestUser(
  email = TEST_USER.email,
  password = TEST_USER.password,
) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(
      '[auth helper] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set -- skipping user creation',
    );
    return null;
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.warn(`[auth helper] Failed to create test user: ${response.status} ${body}`);
    return null;
  }

  return response.json();
}

/**
 * Deletes a test user from Supabase using the Admin API.
 *
 * @param userId - The Supabase auth user id to delete
 */
export async function deleteTestUser(userId: string) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(
      '[auth helper] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set -- skipping user deletion',
    );
    return;
  }

  const response = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users/${userId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
    },
  );

  if (!response.ok) {
    const body = await response.text();
    console.warn(`[auth helper] Failed to delete test user: ${response.status} ${body}`);
  }
}

/**
 * Looks up a Supabase auth user by email and returns their id.
 * Returns null if env vars are missing or user is not found.
 */
export async function findTestUserByEmail(
  email = TEST_USER.email,
): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;

  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
    },
  });

  if (!response.ok) return null;

  const data = await response.json();
  const user = data.users?.find(
    (u: { email: string }) => u.email === email,
  );
  return user?.id ?? null;
}

/**
 * Convenience function: finds and deletes the test user by email.
 */
export async function cleanupTestUser(email = TEST_USER.email) {
  const userId = await findTestUserByEmail(email);
  if (userId) {
    await deleteTestUser(userId);
  }
}
