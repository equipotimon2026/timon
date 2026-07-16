-- 012_talo_payments.sql — Paywall Talo + referidos
-- Pago único desbloquea módulos 4+. Whitelist payment_exempt para usuarios
-- existentes. Códigos de referido: grupo (dueño + usuarios) >= 4 → 25% off.

-- A. Columnas en users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS payment_exempt BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Whitelist: todos los usuarios existentes al momento del deploy quedan exentos.
-- Usuarios nuevos nacen con payment_exempt = FALSE (default).
UPDATE public.users SET payment_exempt = TRUE;

-- B. Actividad de códigos de referido.
-- user_id UNIQUE = un usuario puede usar UN solo código, una vez, inmutable.
CREATE TABLE IF NOT EXISTS public.referral_uses (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  owner_user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (user_id <> owner_user_id)
);
CREATE INDEX IF NOT EXISTS idx_referral_uses_code ON public.referral_uses(code);
CREATE INDEX IF NOT EXISTS idx_referral_uses_owner ON public.referral_uses(owner_user_id);

-- C. Pagos Talo
CREATE TABLE IF NOT EXISTS public.payments (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  talo_payment_id TEXT UNIQUE,
  external_id TEXT UNIQUE NOT NULL,
  base_amount NUMERIC NOT NULL,
  amount NUMERIC NOT NULL,
  discount_pct NUMERIC NOT NULL DEFAULT 0,
  referral_code TEXT,
  currency TEXT NOT NULL DEFAULT 'ARS',
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','SUCCESS','OVERPAID','UNDERPAID','EXPIRED','CANCELLED')),
  payment_url TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- D. Settings editables desde admin
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.app_settings (key, value)
VALUES ('payment_price_ars', '{"amount": 150000}')
ON CONFLICT (key) DO NOTHING;

-- E. RLS: deny-all para anon/authenticated. Todo el acceso va por service role
--    (API routes con createAdminClient), que bypasea RLS.
ALTER TABLE public.referral_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
