@AGENTS.md

## Reglas del proyecto

### Supabase: nunca inicializar en el frontend
- No usar `createBrowserClient` ni `@/lib/supabase/client` en ningún componente o página del frontend.
- Toda interacción con Supabase debe ir a través de API routes (`src/app/api/`) o server actions (`src/app/actions/`).
- Para cerrar sesión: llamar al endpoint `/api/auth/sign-out`, limpiar `localStorage`, y redirigir. No se necesita llamar a Supabase desde el cliente.
- El admin client (`SUPABASE_SERVICE_ROLE_KEY`) solo se usa en API routes, nunca en server actions ni en el frontend.

### Testing E2E
- Tests Playwright viven en `e2e/`. Config en `playwright.config.ts`.
- **Siempre testear contra `http://localhost:3000`**, nunca contra prod. Levantar `npm run dev` antes (o `reuseExistingServer: true` lo reusa automáticamente).
- Prod deployada en `https://timon-xi.vercel.app` — solo para smoke checks manuales del usuario, no para tests automatizados.
- Correr suite: `npx playwright test`. Listar: `npx playwright test --list`.
- Credenciales de test: el usuario las provee fuera de banda. No commitear creds en el repo; usar env vars `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` y leerlas con `process.env` en helpers.

### Costo: NO disparar análisis con IA en tests ni en flujos automáticos
- Los tests E2E que completan formularios deben llegar hasta el final del form pero **NO presionar "Enviar a revisión" / "Analizar" / cualquier acción que dispare los agentes de IA** sobre el perfil. Esa operación es cara.
- Alcance de cobertura E2E: hasta completar los forms, no más.

### Numeración de módulos
- `SECTION_IDS` (técnico, en `src/lib/constants.ts`) ≠ numeración del PRD de producto. Los docs del equipo (PDFs como "Cambios_Pendientes_MVP") usan numeración 1-13 por orden de aparición en UI/PRD, no por `sectionId`.
- Para mapear PRD → form: identificar por contenido del módulo (ej: "materias gusta/no gusta" → `voscolegio-form.tsx`).
