import { test, expect } from '@playwright/test';

const EMAIL = 'tomas.monge2704@gmail.com';
const PASS = '123456';

async function login(page: any) {
  await page.goto('/es/login');
  await page.locator('#email').fill(EMAIL);
  await page.getByRole('button', { name: /continuar/i }).click();
  await page.locator('#password').waitFor({ timeout: 15_000 });
  await page.locator('#password').fill(PASS);
  await page.getByRole('button', { name: /ingresar|entrar|continuar/i }).click();
  await page.waitForURL((url: URL) => !url.pathname.includes('/login'), { timeout: 20_000 });
  await page.waitForTimeout(3000);
}

test('API endpoints respond correctly', async ({ page, request }) => {
  test.setTimeout(120_000);
  await login(page);

  // Get auth cookies from page context
  const cookies = await page.context().cookies();
  const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');

  // GET /api/sections/current
  const sectionsResp = await request.get('http://localhost:3000/api/sections/current', {
    headers: { Cookie: cookieHeader },
  });
  expect(sectionsResp.ok()).toBeTruthy();
  const sectionsBody = await sectionsResp.json();
  expect(sectionsBody.sections).toBeDefined();
  expect(sectionsBody.sections.length).toBeGreaterThanOrEqual(14);
  console.log('[sections/current] sections.length:', sectionsBody.sections.length);

  // GET /api/users/me/sections-status
  const statusResp = await request.get('http://localhost:3000/api/users/me/sections-status', {
    headers: { Cookie: cookieHeader },
  });
  expect(statusResp.ok()).toBeTruthy();
  const statusBody = await statusResp.json();
  console.log('[sections-status] assessment_outdated:', statusBody.assessment_outdated);
  console.log('[sections-status] sections summary:');
  statusBody.sections.forEach((s: any) =>
    console.log(`  ${s.code} (${s.section_id}) → ${s.status} (user_v=${s.user_version_completed})`)
  );

  // GET /api/assessments/latest
  const latestResp = await request.get('http://localhost:3000/api/assessments/latest', {
    headers: { Cookie: cookieHeader },
  });
  expect(latestResp.ok()).toBeTruthy();
  const latestBody = await latestResp.json();
  console.log('[assessments/latest] is_outdated:', latestBody.assessment?.is_outdated);
});

test('UI: banner + journey states + back button', async ({ page }) => {
  test.setTimeout(180_000);
  await login(page);
  await page.screenshot({ path: 'test-results/v01-home.png', fullPage: true });

  // Click step 3 "Resultados"
  await page.getByText(/^Resultados$/i).first().click();
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'test-results/v02-results.png', fullPage: true });

  // Banner amber "actualizamos ... formularios" should appear (home-content banner)
  const banner = page.getByText(/actualizamos (algunos|los) formularios/i);
  await expect(banner).toBeVisible({ timeout: 10_000 });
  await page.screenshot({ path: 'test-results/v03-banner.png', fullPage: true });

  // Click "Ver formularios actualizados"
  const ctaBtn = page.getByRole('button', { name: /ver formularios actualizados/i }).first();
  await ctaBtn.click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/v04-back-to-tests.png', fullPage: true });

  // Should be back in step 0 (JourneyPath visible). Look for missing sections (vibecheck etc)
  // Or look for the JourneyPath element
  await page.waitForTimeout(1500);

  // Outdated badge "Actualizado" — none of the sections are outdated for this user (all v1=v1)
  // but missing/current sections (vibecheck, padres, profesionales) should appear as current/active

  await page.screenshot({ path: 'test-results/v05-journey-path.png', fullPage: true });

  // Tabs deben funcionar como navegación. Click step "Resultados" lleva a step 2.
  await page.locator('button[aria-label="Resultados"]').click();
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'test-results/v05b-back-to-results.png', fullPage: true });

  // Click step "Tests" debe volver a step 0
  await page.locator('button[aria-label="Tests"]').click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test-results/v06-back-via-tabs.png', fullPage: true });

  // Verify "Volver a formularios" button NO existe
  const backBtn = page.getByRole('button', { name: /volver a formularios/i });
  expect(await backBtn.count()).toBe(0);
});
