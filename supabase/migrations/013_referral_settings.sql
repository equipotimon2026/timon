-- 013_referral_settings.sql — umbral de grupo y % de descuento configurables
INSERT INTO public.app_settings (key, value)
VALUES
  ('referral_group_size', '{"value": 4}'),
  ('referral_discount_pct', '{"value": 25}')
ON CONFLICT (key) DO NOTHING;
