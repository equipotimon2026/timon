ALTER TABLE public.assessments
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS generated_by TEXT DEFAULT 'user';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assessments_generated_by_check') THEN
    ALTER TABLE public.assessments
      ADD CONSTRAINT assessments_generated_by_check CHECK (generated_by IN ('user', 'admin'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS assessments_one_active_per_user
  ON public.assessments(user_id) WHERE is_active = TRUE;

-- Backfill: marcar como activo el último completed por user.
WITH latest AS (
  SELECT DISTINCT ON (user_id) id
  FROM public.assessments
  WHERE status = 'completed'
  ORDER BY user_id, completed_at DESC NULLS LAST, created_at DESC
)
UPDATE public.assessments SET is_active = TRUE
WHERE id IN (SELECT id FROM latest) AND is_active = FALSE;
