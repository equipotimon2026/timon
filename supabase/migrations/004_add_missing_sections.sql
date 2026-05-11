-- Add missing sections for VIBECHECK, VOSCOLEGIO, PADRES, PROFESIONALES
-- These are referenced in SECTION_IDS constants but missing from the sections table

INSERT INTO public.sections (id, code, name, order_index)
VALUES
  (13, 'VIBECHECK', 'Vibe Check', 13),
  (14, 'VOSCOLEGIO', 'Vos y el Colegio', 14),
  (15, 'PADRES', 'Para Padres', 15),
  (16, 'PROFESIONALES', 'Profesionales', 16)
ON CONFLICT (id) DO NOTHING;
