-- BUG-01 fix — Signup falla con "Database error saving new user"
--
-- Causas raíz probables (verificadas vía script de diagnóstico):
--   1. users_id_seq desincronizada con MAX(public.users.id)
--   2. handle_new_user sin SET search_path explícito (patrón conocido Supabase)
--
-- Solución honesta:
--   A. Resync sequence
--   B. Reescribir trigger con search_path + ON CONFLICT (sin exception handler
--      para que cualquier error futuro sea visible).

-- A. Resync sequence
SELECT setval(
  'public.users_id_seq',
  GREATEST((SELECT COALESCE(MAX(id), 0) FROM public.users), 0) + 1,
  false
);

-- B. Trigger con search_path explícito + idempotencia por auth_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  )
  ON CONFLICT (auth_id) DO NOTHING;
  RETURN NEW;
END;
$$;
