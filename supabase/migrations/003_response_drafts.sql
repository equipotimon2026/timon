CREATE TABLE public.response_drafts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  section_id INTEGER NOT NULL REFERENCES public.sections(id),
  draft_data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, section_id)
);

CREATE INDEX idx_response_drafts_user ON public.response_drafts(user_id);

ALTER TABLE public.response_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drafts_select_own" ON public.response_drafts
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "drafts_insert_own" ON public.response_drafts
  FOR INSERT TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "drafts_update_own" ON public.response_drafts
  FOR UPDATE TO authenticated
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "drafts_delete_own" ON public.response_drafts
  FOR DELETE TO authenticated
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
