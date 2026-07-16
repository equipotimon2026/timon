# Sistema de pagos (Talo) y referidos grupales

> Última actualización: 2026-07-16. Fuente de verdad del paywall de Timon: cómo se cobra, cómo funcionan los códigos de referido, qué tablas/endpoints existen y cómo operarlo.

## 1. Modelo de producto

- Los **primeros 3 módulos** del journey son gratis (orden UI de `JOURNEY_STEPS_CONFIG`: vibecheck, voscolegio, familia).
- A partir del **4to módulo** se requiere un **pago único** que desbloquea todos los módulos restantes (4-13) y el análisis.
- Pago por **transferencia bancaria en ARS vía Talo**: se genera un pago con CVU/alias único, el usuario transfiere desde su home banking, Talo concilia automáticamente.
- **Precio de lista**: configurable desde el admin (arrancó en **150.000 ARS**).
- **Descuento grupal**: cuando un grupo de referidos llega a **N personas** (default 4), todos los miembros que aún no pagaron obtienen **X% de descuento** (default 25%). N y X son configurables desde el admin.
- **Whitelist**: usuarios existentes al momento del lanzamiento quedaron marcados `payment_exempt = true` (no pagan). El admin puede eximir/des-eximir a cualquiera.
- **Sin retroactividad**: el descuento se evalúa al momento de crear el pago. Quien pagó precio lleno antes de que su grupo se complete no recibe refund. Refunds/devoluciones: manuales (Talo dashboard o `talo.refunds`, no automatizado).

## 2. Sistema de referidos

- Cada usuario tiene un **código propio** (6 caracteres, alfabeto sin ambiguos, ej: `CNK9V7`). Se genera **lazy** la primera vez que se necesita (paywall, dropdown, quote) — cubre usuarios creados por el trigger de signup y los históricos.
- **Grupo de un código** = dueño (1) + usuarios que lo ingresaron. Grupo ≥ N → descuento para todos los que no pagaron (dueño incluido).
- Un usuario puede ingresar **un solo código, una vez, inmutable**, y nunca el propio (constraints de DB: `UNIQUE(user_id)` + `CHECK user_id <> owner_user_id`).
- Se puede ingresar un código incluso después de pagar (suma al grupo para beneficiar al resto; no cambia el propio pago).
- **Dónde lo ve el usuario**:
  - **PaywallScreen** (al intentar abrir módulo 4+ sin pagar): su código + copiar, progreso del grupo, input para cargar un código, precio con descuento tachado.
  - **Dropdown del avatar** (siempre, exentos incluidos): bloque "Tu código de amigos" + copiar + progreso, input "¿Te pasaron un código?" mientras no haya usado uno.
  - **"Mi plan"** (item del dropdown → dialog): Plan **Individual** o Plan **Amigos** (si usó un código), email del dueño del grupo, progreso `n/N`, cuántos faltan para activar el descuento.

## 3. Modelo de datos (migraciones `012_talo_payments.sql` y `013_referral_settings.sql`)

### `users` (columnas agregadas)
| Columna | Tipo | Notas |
|---|---|---|
| `payment_exempt` | boolean, default false | Whitelist. Backfill `true` para todos los existentes al deploy |
| `referral_code` | text UNIQUE | Generado lazy en código (no trigger) |

### `payments`
| Columna | Notas |
|---|---|
| `user_id` | FK `users.id` |
| `talo_payment_id` | UNIQUE, id del pago en Talo |
| `external_id` | UNIQUE, UUID nuestro enviado a Talo (matching de webhook) |
| `base_amount` / `amount` | precio de lista / precio final cobrado |
| `discount_pct` | 0 o el % aplicado |
| `referral_code` | código que habilitó el descuento (null si no hubo) |
| `status` | `PENDING · SUCCESS · OVERPAID · UNDERPAID · EXPIRED · CANCELLED` |
| `payment_url` | página hosteada de Talo (CVU/alias) |
| `expires_at` | Talo expira pagos ~5 días |

Índices: `user_id`, `status`, y **único parcial `(user_id) WHERE status='PENDING'`** → imposible tener 2 pagos PENDING del mismo usuario (protección doble-submit a nivel DB).

### `referral_uses`
Un row por usuario que ingresó un código: `user_id UNIQUE`, `code`, `owner_user_id` (denormalizado), `created_at`. Tamaño de grupo = `1 + COUNT(*) WHERE code = X`.

### `app_settings` (key/value JSONB, editable en `/es/admin/settings`)
| Key | Default | Significado |
|---|---|---|
| `payment_price_ars` | `{"amount": 150000}` | Precio de lista |
| `referral_group_size` | `{"value": 4}` | Personas para completar grupo |
| `referral_discount_pct` | `{"value": 25}` | % de descuento grupal |

Si las keys faltan o son inválidas, el código usa los defaults (4 / 25) — fallback en `getReferralSettings()`.

**RLS**: las 3 tablas nuevas tienen RLS habilitado sin policies (deny-all). Todo el acceso pasa por API routes con service role.

### Regla de acceso (siempre derivada, nunca denormalizada)
```
tiene_acceso = users.payment_exempt
             OR EXISTS (payments WHERE user_id = X AND status IN ('SUCCESS','OVERPAID'))
```

## 4. Arquitectura de código

### Librerías server (`src/lib/`)
| Archivo | Qué expone |
|---|---|
| `talo.ts` | `getTaloClient()` singleton del SDK `talo-pay` (server-only), `getAppUrl()` |
| `payment-pricing.ts` | **Puro, sin IO**: `computePrice(base, groupSize, threshold?, pct?)`, `isPaidOrder(order)`, defaults. Tests: `src/lib/__tests__/payment-pricing.test.ts` (`npm run test:unit`) |
| `payment-access.ts` | `hasPaidAccess`, `getPaymentPriceArs`, `getReferralSettings`, `getOrCreateReferralCode` (lazy + manejo de colisiones 23505), `groupSizeOfCode`, `getReferralGroups`, `getPriceForUser` |
| `section-gate.ts` | `isSlugPaymentLocked`, `isSectionPaymentLocked` — módulo pago + sin acceso |
| `api-auth.ts` | `getAuthedUserId(req)` — cookie → `users.id`, patrón común de los routes |

### Endpoints
| Ruta | Método | Qué hace |
|---|---|---|
| `/api/payments` | POST | Crea pago Talo. 409 si ya tiene acceso; **reusa** PENDING vigente al mismo precio; si el precio cambió/expiró → cancela row local (guard `status='PENDING'`) y crea nuevo; race de doble-submit resuelto por índice único + 23505 → devuelve el pago del ganador. `redirect_url` = **origin del request** (evita perder sesión cross-domain); `webhook_url` = `NEXT_PUBLIC_APP_URL` |
| `/api/payments/status` | GET | Estado del último pago (excluye CANCELLED). Si sigue PENDING **re-consulta a Talo** y actualiza (cubre webhook perdido y dev local). Devuelve `{ status, hasAccess }` |
| `/api/payments/quote` | GET | Todo lo que necesita la PaywallScreen: precio (con descuento si aplica), códigos y grupos, settings, pago pendiente reutilizable, `lastPaymentStatus` (para aviso UNDERPAID) |
| `/api/referrals/use` | POST | Ingresar código: 400 vacío / 404 inexistente / 409 ya usó / 422 propio / 500 error real (distingue 23505) |
| `/api/referrals/me` | GET | Para dropdown y "Mi plan": `myCode`, `myGroupSize`, `usedCode`, `usedGroupSize`, `ownerEmail`, `groupSizeThreshold`, `discountPct` |
| `/api/webhooks/talo` | POST | `createWebhookHandler` del SDK (valida y re-consulta el estado real a Talo — anti-spoofing). Matchea por `external_id`, actualiza status con **guard atómico** (`NOT IN ('SUCCESS','OVERPAID')` en el UPDATE). Encuentra también rows CANCELLED locales (si el usuario pagó un link viejo, igual desbloquea) |
| `/api/admin/users/[id]` | PATCH | `{ payment_exempt: boolean }` (toggle desde admin) |
| `/api/admin/settings/payments` | GET/PUT | `{ priceArs, groupSize, discountPct }` con validación |

### Enforcement (server-side, no bypasseable)
El candado visual del journey es cosmético; lo que bloquea de verdad:
1. `assessment/[id]/page.tsx` — render de PaywallScreen en vez del form si `isSlugPaymentLocked`.
2. `POST /api/responses` — 402 si la sección está bloqueada.
3. Server actions `saveQuestionnaireResponse` y `saveDraft` — throw si bloqueada.

### UI
| Componente | Rol |
|---|---|
| `paywall-screen.tsx` | Pantalla de pago: precio, descuento, código propio, input de código, botón pagar → redirect a `payment_url` de Talo. Banner ámbar si UNDERPAID (oculta el botón para evitar doble pago) |
| `payment-callback-content.tsx` (`/es/payment/callback`) | Vuelta de Talo: polling 3s×20 a `/api/payments/status`; éxito → journey; UNDERPAID → aviso; timeout → "puede demorar" |
| `journey-*` | `sections-status` devuelve `payment_locked` por sección → candado gris con ícono Lock en módulos 4+ sin acceso. Click abre modal con PaywallScreen |
| `user-header.tsx` | Dropdown avatar: bloque código de amigos (fetch lazy al abrir), input de código, item "Mi plan" → dialog Individual/Amigos |
| Admin | Lista usuarios: columna Pago (Exento/Pagado/Pagado -X%/Sin pagar) + toggle eximir. Detalle usuario: sección "Pago y referidos" (tabla de pagos, referidos captados con nombre/email, código usado). Settings: precio + tamaño de grupo + % descuento |

## 5. Flujo de un pago (end-to-end)

```
Usuario toca módulo 4+ sin acceso
  → PaywallScreen (quote: precio final según su grupo)
  → [opcional] ingresa código de amigo (POST /api/referrals/use)
  → botón Pagar → POST /api/payments → payment_url de Talo
  → transfiere desde su banco al CVU único
  → Talo → POST /api/webhooks/talo → payments.status = SUCCESS
  → Talo redirige al usuario a /es/payment/callback (mismo dominio donde navegaba)
  → polling confirma → journey desbloqueado
```

Casos borde cubiertos:
- **Webhook perdido / dev local**: el polling del callback re-consulta a Talo directamente.
- **Grupo llega a N con un PENDING a precio lleno**: el paywall regenera el pago con descuento (el viejo queda CANCELLED local; si el usuario paga el link viejo igual, el webhook lo marca SUCCESS y desbloquea).
- **UNDERPAID** (transfirió de menos): no desbloquea; aviso en callback y en paywall; resolución manual (refund o eximir desde admin).
- **OVERPAID**: desbloquea.
- **EXPIRED** (~5 días): el paywall genera un pago nuevo.
- **Doble click en Pagar**: índice único parcial + manejo 23505 → un solo pago.
- **Webhooks concurrentes / webhook vs polling**: updates con condición atómica en el WHERE (nunca se pisa un estado final).

## 6. Configuración

### Variables de entorno (server-only salvo las NEXT_PUBLIC)
```
TALO_CLIENT_ID / TALO_CLIENT_SECRET / TALO_USER_ID   # credenciales Talo (secret JAMÁS al frontend)
TALO_ENVIRONMENT=production                           # o sandbox (sandbox-api.talo.com.ar)
NEXT_PUBLIC_APP_URL=https://app.timonear.com          # base para webhook_url; el redirect_url usa el origin del request
```
Ver `.env.example`. En Vercel deben estar en Production.

### Operación en admin (`/es/admin`)
- **Cambiar precio / grupo / descuento**: `/es/admin/settings`. Afecta pagos futuros; los PENDING viejos se regeneran solos al volver al paywall.
- **Eximir usuario** (colegios, pilotos, resolución de UNDERPAID): toggle en la lista de usuarios.
- **Seguimiento**: detalle de usuario → sección "Pago y referidos" (pagos con montos/estados/ID Talo, quiénes usaron su código, qué código usó).

## 7. Testing

- **Unit** (`npm run test:unit`): lógica pura de precios (thresholds, descuentos, redondeo).
- **E2E** (`npx playwright test e2e/paywall.spec.ts`): módulo 4 bloqueado / módulo 1 gratis / código inválido. Flipea `payment_exempt` del test user vía service role y lo **restaura siempre**; corre en modo serial.
- **Reglas de costo (NUNCA romper)**:
  - Los tests jamás clickean "Pagar" ni llaman `POST /api/payments` — las credenciales Talo son **productivas** (dinero real).
  - Jamás usar un código de referido con el test user (el uso es inmutable).
  - Jamás disparar análisis IA desde tests.
- **Prueba real**: bajar el precio en admin a un monto chico, pagar con un usuario de prueba no exento, verificar webhook (`payments.status = SUCCESS`) y desbloqueo, restaurar precio.

## 8. Deuda conocida (backlog)

- Rate limiting del webhook (cada POST anónimo dispara una consulta a Talo).
- Validación fail-fast de env vars Talo (hoy fallan tarde con error críptico si faltan).
- Bloqueo server-side de crear pago nuevo con UNDERPAID previo (hoy solo lo bloquea la UI).
- Admin no des-exenta "limpio" a un usuario con módulos ya completados (los completados quedan accesibles; regla de producto pendiente).
- Total recaudado / lista global de transacciones en admin (decidido: no por ahora).

## 9. Referencias

- Docs Talo: https://docs.talo.com.ar (SDK TypeScript: `/transfers/sdk` · sandbox: `/sandbox` + simulador de transferencias)
- SDK npm: `talo-pay`
- Migraciones: `supabase/migrations/012_talo_payments.sql`, `013_referral_settings.sql`
