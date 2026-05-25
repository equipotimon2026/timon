-- ============================================
-- 009 — Section Versioning
-- Additive: all new columns are nullable or have defaults.
-- No existing data is modified (except backfills at the end).
-- ============================================

-- Enable pgcrypto for SHA-256 in the backfill below.
-- Supabase enables it by default, but guard with IF NOT EXISTS just in case.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ────────────────────────────────────────────
-- 1. sections — version tracking columns
-- ────────────────────────────────────────────
ALTER TABLE public.sections
  ADD COLUMN IF NOT EXISTS current_version INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS questions_hash TEXT,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT NOW();

-- ────────────────────────────────────────────
-- 2. section_versions_log — one row per (section, version)
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.section_versions_log (
  id BIGSERIAL PRIMARY KEY,
  section_id INT NOT NULL REFERENCES public.sections(id),
  version INT NOT NULL,
  questions_hash TEXT NOT NULL,
  questions_snapshot JSONB NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (section_id, version)
);

-- No RLS on section_versions_log: accessed only from server (service_role).

-- ────────────────────────────────────────────
-- 3. responses — per-question hash for matching across versions
-- ────────────────────────────────────────────
ALTER TABLE public.responses
  ADD COLUMN IF NOT EXISTS question_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_responses_question_hash
  ON public.responses(user_id, section_id, question_hash);

-- ────────────────────────────────────────────
-- 4. assessments — snapshot of section versions used for that run
-- ────────────────────────────────────────────
ALTER TABLE public.assessments
  ADD COLUMN IF NOT EXISTS section_versions JSONB;

-- ────────────────────────────────────────────
-- 5. Backfill: responses.question_hash from responses.question
--    sha256(lower(trim(question))) — matches the seed script logic
-- ────────────────────────────────────────────
UPDATE public.responses
SET question_hash = encode(digest(lower(trim(question)), 'sha256'), 'hex')
WHERE question_hash IS NULL AND question IS NOT NULL;

-- ────────────────────────────────────────────
-- 6. Backfill: assessments.section_versions
--    All pre-versioning assessments are assumed to be v1 for all sections.
-- ────────────────────────────────────────────
UPDATE public.assessments
SET section_versions = (
  SELECT jsonb_object_agg(id::text, 1) FROM public.sections
)
WHERE section_versions IS NULL;
