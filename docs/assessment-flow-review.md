# Assessment Flow — Review & Documentación

## Flujo completo

```
Usuario completa 10 tests
        ↓
[Generar mi perfil] → POST /api/analyze
        ↓
Arma payload (responses + questions con options) → POST a Azure /api/assessments
        ↓
Azure devuelve assessment_id → se guarda en tabla `assessments` con status=processing
        ↓
Frontend pollea GET /api/analyze?assessment_id=...&email=... cada 20s
        ↓
GET proxea a Azure → si completed: guarda results en `assessments` table
        ↓
Frontend recibe results → muestra tab Resultados
        ↓
Page reload: lee `assessments` de la DB → si completed, muestra results directo (sin Azure)
```

## Tablas involucradas

| Tabla | Propósito |
|---|---|
| `users` | Perfil del usuario |
| `responses` | Respuestas a los cuestionarios |
| `questions` | Preguntas + opciones disponibles (388 rows) |
| `assessments` | Estado y resultados del análisis de Azure |
| `section_results` | Resultados parciales por sección (no usado en el flujo de análisis) |

## Escenarios

| Estado en DB | Comportamiento | Llama a Azure? |
|---|---|---|
| `assessments.status = 'completed'` | Directo a tab Resultados | NO |
| `assessments.status = 'processing'` | Resume polling cada 20s | Solo GET poll |
| `assessments.status = 'failed'` | Muestra error + botón Reintentar | POST crea nuevo |
| Sin registro en `assessments` | Botón "Generar mi perfil vocacional" | POST + polling |

---

## Hallazgos del Code Review

### CRÍTICOS

#### 1. GET /api/analyze sin autenticación
**Archivo:** `src/app/api/analyze/route.ts` (handler GET)
**Problema:** El GET no verifica identidad del usuario. Cualquiera que conozca un `assessment_id` + email puede leer los resultados y triggear escritura en la DB.
**Fix:** Agregar auth check con `createServerClient` + `getUser()`.

#### 2. Sección APRENDIZAJE (ID=8) no se envía a Azure
**Archivos:** `src/app/api/analyze/route.ts` (SECTION_NAMES), `src/lib/constants.ts`
**Problema:** `SECTION_NAMES` no incluye APRENDIZAJE (section_id=8). Las respuestas existen en la DB pero se descartan al armar el payload.
**Fix:** Agregar la entrada faltante en `SECTION_NAMES` o validar que las secciones sean consistentes.

#### 3. Estado `failed` no se maneja en el frontend
**Archivo:** `src/components/home-content.tsx`
**Problema:** Solo se chequea `completed` y `processing`. Si el assessment falló, el usuario queda en step 0 (selección de tests) sin indicación de error ni opción de reintentar.
**Fix:** Agregar `hasFailedAssessment` y mostrar step 1 con el retry visible.

### WARNINGS

#### 4. `page.tsx` usa `.single()` que falla con 0 rows
**Archivo:** `src/app/[locale]/(app)/page.tsx`
**Problema:** `.single()` tira error PostgREST 406 si no hay assessments (usuario nuevo). Debería usar `.maybeSingle()`.

#### 5. GET /api/questions sin autenticación
**Archivo:** `src/app/api/questions/route.ts`
**Problema:** Endpoint público que expone todo el banco de preguntas sin auth check.

#### 6. Primer poll demorado 20s en submit fresco
**Archivo:** `src/components/wizard/assessment-summary.tsx`
**Problema:** En `handleSubmit`, el `setTimeout` está antes del primer fetch. En `resumePolling` está después. Inconsistencia que agrega 20s innecesarios.

#### 7. Admin client se recrea por cada invocación
**Archivo:** `src/lib/supabase/admin.ts`
**Problema:** `createAdminClient()` crea un nuevo client cada vez. Debería ser singleton.

#### 8. `maxDuration = 60` puede cortar el POST antes de guardar en DB
**Archivo:** `src/app/api/analyze/route.ts`
**Problema:** Si Azure tarda >60s en responder al POST inicial (cold start), la función se corta y nunca se inserta el registro en `assessments`.

### INFO

#### 9. `select('*')` en page.tsx over-fetches datos del usuario
#### 10. `src/lib/supabase/client.ts` existe pero está prohibido por CLAUDE.md
#### 11. Progress bar se queda en 99% hasta 7 minutos extra
#### 12. Cookies de sesión no se propagan en `/api/assessments/completed`
