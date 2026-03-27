@AGENTS.md

## Reglas del proyecto

### Supabase: nunca inicializar en el frontend
- No usar `createBrowserClient` ni `@/lib/supabase/client` en ningún componente o página del frontend.
- Toda interacción con Supabase debe ir a través de API routes (`src/app/api/`) o server actions (`src/app/actions/`).
- Para cerrar sesión: llamar al endpoint `/api/auth/sign-out`, limpiar `localStorage`, y redirigir. No se necesita llamar a Supabase desde el cliente.
- El admin client (`SUPABASE_SERVICE_ROLE_KEY`) solo se usa en API routes, nunca en server actions ni en el frontend.
