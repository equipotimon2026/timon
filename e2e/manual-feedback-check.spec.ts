import { test, expect } from '@playwright/test';

const EMAIL = 'tomas.monge2704@gmail.com';
const PASS = '123456';

test('feedback fixes visual check', async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto('/es/login');
  await page.locator('#email').fill(EMAIL);
  await page.getByRole('button', { name: /continuar/i }).click();
  await page.locator('#password').waitFor({ timeout: 15_000 });
  await page.locator('#password').fill(PASS);
  await page.getByRole('button', { name: /ingresar|entrar|continuar/i }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 20_000 });

  await page.screenshot({ path: 'test-results/01-home.png', fullPage: true });

  // Click step 3 "Resultados" in ProgressSteps
  const resultadosStep = page.getByText(/^Resultados$/i).first();
  await resultadosStep.click();
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'test-results/02-results-loaded.png', fullPage: true });

  // Navigate to "Tu mapa interno" — sidebar item
  const mapaLink = page.getByRole('button', { name: /tu mapa interno/i }).first();
  if (await mapaLink.isVisible().catch(() => false)) {
    await mapaLink.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/03-mapa-default.png', fullPage: true });

    // click Personalidad tab
    const persoTab = page.getByRole('button', { name: /personalidad/i }).first();
    if (await persoTab.isVisible().catch(() => false)) {
      await persoTab.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: 'test-results/04-mapa-mips.png', fullPage: true });
    }
  }

  // Navigate to Carreras
  const losCaminos = page.getByRole('button', { name: /los caminos/i }).first();
  if (await losCaminos.isVisible().catch(() => false)) {
    await losCaminos.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/05-carreras-intro.png', fullPage: true });
  }

  const tuTop5 = page.getByRole('button', { name: /tu top 5|top 5/i }).first();
  if (await tuTop5.isVisible().catch(() => false)) {
    await tuTop5.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/06-carreras-lista.png', fullPage: true });
  }

  // Open first career card
  const firstCareer = page.locator('article').first();
  if (await firstCareer.isVisible().catch(() => false)) {
    await firstCareer.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/07-carrera-detalle-top.png', fullPage: true });

    // scroll to "Qué vas a estudiar"
    const estudiar = page.getByRole('heading', { name: /qué vas a estudiar/i }).first();
    if (await estudiar.isVisible().catch(() => false)) {
      await estudiar.scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      await page.screenshot({ path: 'test-results/08-carrera-estudiar.png', fullPage: true });
    }
  }

  // Navigate to Universidades filtros
  const donde = page.getByRole('button', { name: /dónde construir|donde construir/i }).first();
  if (await donde.isVisible().catch(() => false)) {
    await donde.click();
    await page.waitForTimeout(800);
  }
  const encontrar = page.getByRole('button', { name: /encontrar tu lugar|encontrá tu lugar/i }).first();
  if (await encontrar.isVisible().catch(() => false)) {
    await encontrar.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/09-universidades-filtros.png', fullPage: true });
  }

  // Open first university
  const firstUni = page.locator('article').first();
  if (await firstUni.isVisible().catch(() => false)) {
    await firstUni.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/10-universidad-detalle-top.png', fullPage: true });

    const becas = page.getByRole('heading', { name: /becas y accesos/i }).first();
    if (await becas.isVisible().catch(() => false)) {
      await becas.scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      await page.screenshot({ path: 'test-results/11-universidad-becas.png', fullPage: true });
    }
  }

  expect(true).toBe(true);
});
