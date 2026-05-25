CREATE TABLE IF NOT EXISTS public.admin_whitelist (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

ALTER TABLE public.admin_whitelist ENABLE ROW LEVEL SECURITY;
-- No policies: solo service_role accede.

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_whitelist w
    JOIN auth.users u ON u.email = w.email
    WHERE u.id = auth.uid()
  );
$$;
