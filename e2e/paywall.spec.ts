import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { TEST_USER, loginViaUI } from './helpers/auth';

/**
 * Paywall: módulos 4+ requieren pago. El test flipea payment_exempt del
 * usuario de test vía service role y lo restaura al final.
 * REGLA DE COSTO: jamás clickear "Pagar por transferencia" ni disparar
 * el análisis IA -- credenciales Talo productivas / análisis costoso.
 */

// Playwright no carga .env.local automáticamente (a diferencia de `next dev`).
// No hay `dotenv` en devDependencies -- parseamos el archivo a mano si las
// env vars no vienen ya exportadas en el shell.
function loadEnvLocal() {
  const envPath = path.resolve(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const admin =
  SUPABASE_URL && SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    : null;

async function setExempt(exempt: boolean) {
  if (!admin) return;
  const { error } = await admin
    .from('users')
    .update({ payment_exempt: exempt })
    .eq('email', TEST_USER.email);
  if (error) throw error;
}

const canRun = !!admin && !!process.env.E2E_TEST_EMAIL && !!process.env.E2E_TEST_PASSWORD;

test.describe('paywall', () => {
  // beforeAll/afterAll flipean payment_exempt del mismo user real vía
  // service role. fullyParallel + multi-worker correrían esto 3 veces en
  // paralelo (race). Forzar un solo worker secuencial para este describe.
  test.describe.configure({ mode: 'serial' });

  test.skip(!canRun, 'Sin credenciales E2E o SUPABASE_SERVICE_ROLE_KEY (E2E_TEST_EMAIL/PASSWORD/SUPABASE_SERVICE_ROLE_KEY)');

  test.beforeAll(async () => {
    await setExempt(false);
  });

  test.afterAll(async () => {
    // Restaurar SIEMPRE, pase lo que pase con los tests (incluso si fallaron).
    try {
      await setExempt(true);
    } catch (err) {
      // Reintentar una vez antes de dejar el error visible -- este usuario
      // de test debe quedar exento pase lo que pase.
      console.error('[paywall.spec] fallo al restaurar payment_exempt, reintentando', err);
      await setExempt(true);
    }
  });

  test('módulo 4 muestra paywall para usuario sin pago', async ({ page }) => {
    await loginViaUI(page);
    await page.goto('/es/assessment/padres');
    await expect(page.getByText('Desbloqueá tu análisis completo')).toBeVisible();
    // Precio visible y botón de pago presente (NO clickearlo)
    await expect(page.getByRole('button', { name: /Pagar por transferencia/ })).toBeVisible();
  });

  test('módulo 1 sigue gratis', async ({ page }) => {
    await loginViaUI(page);
    await page.goto('/es/assessment/vibecheck');
    await expect(page.getByText('Desbloqueá tu análisis completo')).not.toBeVisible();
  });

  test('código inexistente da error', async ({ page }) => {
    await loginViaUI(page);
    await page.goto('/es/assessment/padres');
    await page.getByPlaceholder('CÓDIGO').fill('ZZZZZZ');
    await page.getByRole('button', { name: 'Aplicar' }).click();
    await expect(page.getByText('Código inexistente')).toBeVisible();
  });
});
