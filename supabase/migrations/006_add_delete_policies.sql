-- ============================================
-- Add missing DELETE RLS policies
-- ============================================
-- Previously, the saveQuestionnaireResponse server action does delete-then-insert
-- on `responses` to refresh state. Without a DELETE policy, RLS silently rejected
-- the delete (zero rows affected, no error), so the subsequent INSERT would hit
-- a Postgres 23505 unique_violation on (user_id, section_id, question_number).
-- This migration grants DELETE on responses + section_results to authenticated
-- users for their own rows.

CREATE POLICY "responses_delete_own" ON public.responses
  FOR DELETE TO authenticated
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "section_results_delete_own" ON public.section_results
  FOR DELETE TO authenticated
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
