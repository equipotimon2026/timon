-- ============================================
-- TIMON - Initial Database Schema
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS (profiles linked to Supabase Auth)
-- ============================================
CREATE TABLE public.users (
  id BIGSERIAL PRIMARY KEY,
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID UNIQUE,
  first_name TEXT,
  last_name TEXT,
  age INTEGER,
  school TEXT,
  school_year TEXT,
  email TEXT,
  phone_number TEXT,
  persona TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. SECTIONS (reference data)
-- ============================================
CREATE TABLE public.sections (
  id INTEGER PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL
);

INSERT INTO public.sections (id, code, name, order_index) VALUES
  (1, 'BRAVITO', 'Datos Personales', 1),
  (2, 'MILLON', 'Personalidad (MIPS)', 2),
  (3, 'RIASEC', 'Intereses Vocacionales', 3),
  (4, 'HERRMANN', 'Dominancia Cerebral', 4),
  (5, 'GARDNER', 'Inteligencias Multiples', 5),
  (6, 'PROYECTIVA', 'Preguntas Proyectivas', 6),
  (7, 'AUTODESC', 'Auto-descubrimiento', 7),
  (8, 'APRENDIZAJE', 'Estilo de Aprendizaje', 8),
  (9, 'LIFESTYLE', 'Estilo de Vida', 9),
  (10, 'FUTURO', 'Proyeccion de Futuro', 10),
  (11, 'FAMILIA', 'Contexto Familiar', 11),
  (12, 'UNIVERSIDAD', 'Scan Universitario', 12);

-- ============================================
-- 3. RESPONSES
-- ============================================
CREATE TABLE public.responses (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  section_id INTEGER NOT NULL REFERENCES public.sections(id),
  question_number INTEGER NOT NULL,
  question TEXT,
  response_boolean BOOLEAN,
  response_integer INTEGER,
  response_text TEXT,
  response_array JSONB,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, section_id, question_number)
);

-- ============================================
-- 4. SECTION RESULTS
-- ============================================
CREATE TABLE public.section_results (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  section_id INTEGER NOT NULL REFERENCES public.sections(id),
  score_data JSONB,
  meta JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, section_id)
);

-- ============================================
-- 5. SURVEY RESPONSES (onboarding data)
-- ============================================
CREATE TABLE public.survey_responses (
  id BIGSERIAL PRIMARY KEY,
  survey_slug TEXT DEFAULT 'bravito',
  survey_version INTEGER DEFAULT 1,
  user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. FEEDBACK
-- ============================================
CREATE TABLE public.feedback (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  section_id INTEGER NOT NULL REFERENCES public.sections(id),
  feedback TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. UNIVERSITY CATALOG
-- ============================================
CREATE TABLE public.university (
  id BIGSERIAL PRIMARY KEY,
  university TEXT,
  faculty TEXT,
  title TEXT,
  title_type TEXT,
  duration TEXT,
  entry_conditions TEXT,
  location TEXT,
  phone_number TEXT,
  web TEXT,
  email TEXT
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_responses_user_section ON public.responses(user_id, section_id);
CREATE INDEX idx_section_results_user ON public.section_results(user_id);
CREATE INDEX idx_users_auth_id ON public.users(auth_id);
CREATE INDEX idx_survey_responses_user ON public.survey_responses(user_id);
CREATE INDEX idx_feedback_user ON public.feedback(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.university ENABLE ROW LEVEL SECURITY;

-- Sections: readable by all authenticated
CREATE POLICY "sections_select_authenticated" ON public.sections
  FOR SELECT TO authenticated USING (true);

-- University: readable by all authenticated
CREATE POLICY "university_select_authenticated" ON public.university
  FOR SELECT TO authenticated USING (true);

-- Users: own profile only
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT TO authenticated USING (auth_id = auth.uid());
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT TO authenticated WITH CHECK (auth_id = auth.uid());
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE TO authenticated USING (auth_id = auth.uid());

-- Responses: own data only
CREATE POLICY "responses_select_own" ON public.responses
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "responses_insert_own" ON public.responses
  FOR INSERT TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "responses_update_own" ON public.responses
  FOR UPDATE TO authenticated
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Section results: own data only
CREATE POLICY "section_results_select_own" ON public.section_results
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "section_results_insert_own" ON public.section_results
  FOR INSERT TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "section_results_update_own" ON public.section_results
  FOR UPDATE TO authenticated
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Survey responses: own data only
CREATE POLICY "survey_responses_select_own" ON public.survey_responses
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "survey_responses_insert_own" ON public.survey_responses
  FOR INSERT TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Feedback: own data only
CREATE POLICY "feedback_select_own" ON public.feedback
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "feedback_insert_own" ON public.feedback
  FOR INSERT TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGER: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
