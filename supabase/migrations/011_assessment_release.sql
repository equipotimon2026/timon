-- Mejora #2: gate manual de visibilidad de resultados.
-- Un assessment 'completed' NO se muestra al usuario hasta que un admin lo libera
-- manualmente con el boton "Liberar resultado" (setea released_at = now()).
ALTER TABLE public.assessments
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;

-- Backfill: los resultados ya existentes y completados se consideran liberados
-- (no romper a usuarios que ya estaban viendo su perfil).
UPDATE public.assessments
  SET released_at = COALESCE(completed_at, created_at)
  WHERE status = 'completed' AND released_at IS NULL;
