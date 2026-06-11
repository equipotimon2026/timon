import { test, expect, type Page } from '@playwright/test';

// =============================================================================
// JOURNEY — CONTRATO NUEVO (career_section + universities)
//
// Verifica el output migrado (Acto 02 Carreras + Acto 03 Universidades) contra
// el contrato nuevo del agente, inyectando los resultados vía route-interception
// (NO toca la DB, NO dispara el análisis IA). Cubre:
//   - PDF p1: sin páginas intro en módulos 2 y 3 (se entra directo a la lista)
//   - PDF p2: card reducida a número + título + % match
//   - PDF p3: detalle con profesión + bubbles (Cosmos) + 4 caminos + academics
//   - Universidades: filtros simplificados + detalle con sección "Programas"
//
// Requiere auth real (multi-step login). Se saltea si no hay credenciales.
// =============================================================================

const EMAIL = process.env.E2E_TEST_EMAIL;
const PASSWORD = process.env.E2E_TEST_PASSWORD;

// Resultado en shape NUEVO, suficiente para las aserciones.
const NEW_RESULTS = {
  meta: { test: true },
  careers: {
    intro: 'Estos son tus caminos.',
    ranking: [
      {
        id: 'ciencia-de-datos',
        name: 'Licenciatura en Ciencia de Datos',
        field: 'Tecnología',
        matchPercentage: 88,
        programSearchGroup: 'Ciencia de Datos y Analítica',
        lifeGlimpse: 'Días traduciendo preguntas en modelos.',
        detail: {
          professionDescription:
            'Un/a científico/a de datos convierte datos crudos en decisiones.',
          matchSummary: 'Encaja con tu perfil analítico.',
          whyMatch: ['Dominancia analítica', 'Disfrutás la ambigüedad'],
          challenges: ['Mucha limpieza de datos', 'Comunicar a no técnicos'],
          professionalPaths: [
            {
              title: 'Machine Learning Engineer',
              summary: 'Llevás modelos del notebook a producción.',
              dayToDay: {
                entorno: 'Empresa tech',
                conQuien: 'Ingenieros de software',
                horarios: 'Estructurados',
                autonomia: 'Alta sobre el cómo',
              },
              trajectory: [
                {
                  title: 'Junior ML Engineer',
                  description: 'Mantenés pipelines',
                  salaryRange: 'USD 1.200-2.000/mes',
                },
              ],
              lifestyleFit: ['Trabajo enfocado de baja interrupción'],
              lifestyleChallenges: ['Picos en lanzamientos'],
              reflectiveQuestion:
                '¿Te entusiasma que tu modelo corra en producción para millones?',
            },
          ],
          academics: {
            academicComposition:
              'Atravesar varios años de matemática dura antes de los modelos.',
            subjectDistribution: [
              { area: 'Matemática y Estadística', percentage: 35, color: 'indigo' },
              { area: 'Programación y Computación', percentage: 30, color: 'violet' },
            ],
            keySkills: ['Pensamiento estadístico y razonamiento con incertidumbre'],
            alerts: {
              studyHoursLevel: 'alta',
              durationYears: 5,
              workStudyCapacity: 'part_time_posible_mas_sobre_el_final',
            },
          },
        },
      },
    ],
  },
  universities: {
    intro: 'Universidades que dictan tu carrera.',
    ranking: [
      {
        id: 'uba',
        name: 'Universidad de Buenos Aires',
        type: 'Pública',
        modality: 'Presencial',
        matchPercentage: 94,
        glimpse: 'Pública, masiva y prestigiosa.',
        detail: {
          matchReasons: [
            { positive: true, text: 'Gratuita y de alto prestigio' },
            { positive: false, text: 'Requiere CBC previo' },
          ],
          matchSummary: 'Excelente opción pública para tu perfil.',
          prestige: {
            ranking: '#1 Argentina',
            academicQuality: 'Excelente',
            employability: '92%',
            marketReputation: '95%',
          },
          values: {
            description: 'Compromiso social y excelencia.',
            distribution: [{ area: 'Excelencia Académica', percentage: 60 }],
          },
          costs: {
            monthlyFee: 'Gratuita',
            enrollmentFee: 'Sin costo',
            annualEstimate: '$360.000 (materiales)',
          },
          scholarships: [
            { name: 'Beca Sarmiento', coverage: '100% materiales', requirements: 'Promedio > 7' },
          ],
          programs: [
            { name: 'Licenciatura en Ciencias de Datos', duration: '5 años', modality: 'Presencial' },
          ],
          location: {
            address: 'Paseo Colón 850',
            zone: 'CABA Centro',
            transport: 'Línea E',
            campusInfo: 'Campus urbano',
          },
        },
      },
    ],
  },
};

const BUBBLES = {
  group: 'Ciencia de Datos y Analítica',
  universities: [
    {
      universityId: 'uba',
      universityName: 'Universidad de Buenos Aires',
      programName: 'Licenciatura en Ciencias de Datos',
      facultyName: null,
    },
  ],
};

// Intercepta los endpoints del output e inyecta el shape nuevo (sin DB / sin IA).
async function stubApis(page: Page) {
  await page.route('**/api/assessments/latest', (route) =>
    route.fulfill({
      json: {
        assessment: {
          assessment_id: 'pw-new-contract',
          status: 'completed',
          results: NEW_RESULTS,
          is_outdated: false,
          created_at: '2026-06-11T12:00:00Z',
          completed_at: '2026-06-11T12:00:00Z',
          is_active: true,
        },
      },
    })
  );
  await page.route('**/api/universities/by-program-group**', (route) =>
    route.fulfill({ json: BUBBLES })
  );
}

async function login(page: Page) {
  await page.goto('/es/login');
  await page.getByRole('textbox', { name: /correo|email/i }).fill(EMAIL!);
  await page.getByRole('button', { name: /continuar/i }).click();
  await page.getByRole('textbox', { name: /contraseña|password/i }).fill(PASSWORD!);
  await page.getByRole('button', { name: /ingresar/i }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 20000 });
}

// Loguea, abre la pestaña Resultados y entra al Acto 02 (lista de carreras).
async function gotoCareersList(page: Page) {
  await stubApis(page);
  await login(page);
  await page.goto('/es');
  await page.getByRole('button', { name: 'Resultados', exact: true }).click();
  await page.getByRole('button', { name: /Los caminos/ }).click();
  await expect(page.getByText('Explorar este camino').first()).toBeVisible();
}

test.describe('Journey — contrato nuevo', () => {
  test.skip(!EMAIL || !PASSWORD, 'Sin credenciales E2E (E2E_TEST_EMAIL/PASSWORD)');

  test('p1+p2: Acto 02 entra directo a la lista (sin intro) con cards reducidas', async ({ page }) => {
    await gotoCareersList(page);

    // p1: NO existe la hoja intro vieja
    await expect(page.getByText('No hay una carrera perfecta')).toHaveCount(0);

    // p2: card reducida — título + % match, sin stats viejos (h/sem, roles)
    await expect(page.getByText('Licenciatura en Ciencia de Datos').first()).toBeVisible();
    await expect(page.getByText('88%').first()).toBeVisible();
    await expect(page.getByText(/h\/sem/)).toHaveCount(0);
    await expect(page.getByText(/\+\s*roles/)).toHaveCount(0);
  });

  test('p3: detalle de carrera (profesión + bubbles + caminos + academics)', async ({ page }) => {
    await gotoCareersList(page);
    await page.getByRole('button').filter({ hasText: 'Explorar este camino' }).first().click();

    // Profesión (no "estudiar X")
    await expect(
      page.getByText('Un/a científico/a de datos convierte datos crudos en decisiones.')
    ).toBeVisible();

    // Bubbles desde el endpoint Cosmos (stubeado)
    await expect(page.getByText('Dónde se dicta')).toBeVisible();
    await expect(
      page.getByText('Universidad de Buenos Aires', { exact: false }).first()
    ).toBeVisible();

    // Sección "Qué vimos en tu perfil" (abierta por default)
    await expect(page.getByText('Qué vimos en tu perfil')).toBeVisible();
    await expect(page.getByText('Encaja con tu perfil analítico.')).toBeVisible();

    // Caminos: expandir la sección (heading del acordeón, no el label del sidebar) y un path
    await page.getByRole('heading', { name: 'Los caminos' }).click();
    await expect(page.getByText('Machine Learning Engineer')).toBeVisible();
    await page.getByRole('button', { name: /Ver esta vida/ }).first().click();
    await expect(page.getByText('Llevás modelos del notebook a producción.')).toBeVisible();
    await expect(page.getByText('Empresa tech')).toBeVisible();
    await expect(page.getByText('Junior ML Engineer')).toBeVisible();

    // Carrera universitaria
    await page.getByRole('heading', { name: /Cómo es la carrera universitaria/ }).click();
    await expect(page.getByText('Matemática y Estadística')).toBeVisible();

    // Navegación de salida
    await expect(page.getByText('Volver a las carreras').first()).toBeVisible();
    await expect(page.getByText(/Ver universidades de esta carrera/)).toBeVisible();
  });

  test('Acto 03: universidades con detalle y sección "Programas"', async ({ page }) => {
    await gotoCareersList(page);
    await page.getByRole('button', { name: /Dónde construir/ }).click();

    // Card de universidad + filtros simplificados (sin "Religiosa")
    await expect(page.getByText('Universidad de Buenos Aires').first()).toBeVisible();
    await expect(page.getByText('Religiosa')).toHaveCount(0);

    // Detalle
    await page.getByRole('button').filter({ hasText: 'Ver más' }).first().click();
    await expect(page.getByText('Excelente opción pública para tu perfil.')).toBeVisible();
    await expect(page.getByText('Licenciatura en Ciencias de Datos')).toBeVisible();
    // sin CTA de website
    await expect(page.getByText(/Visitar sitio oficial/)).toHaveCount(0);
  });
});
