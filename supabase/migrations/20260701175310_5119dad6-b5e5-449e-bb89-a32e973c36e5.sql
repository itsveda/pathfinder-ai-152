-- Placement profiles: student's academic + skill data
CREATE TABLE public.placement_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  degree text,
  branch text,
  year_of_study text,
  cgpa numeric(4,2),
  tenth_percent numeric(5,2),
  twelfth_percent numeric(5,2),
  backlogs integer DEFAULT 0,
  technical_skills text[] DEFAULT '{}'::text[],
  soft_skills text[] DEFAULT '{}'::text[],
  projects_count integer DEFAULT 0,
  internships_count integer DEFAULT 0,
  certifications text[] DEFAULT '{}'::text[],
  coding_platforms text[] DEFAULT '{}'::text[],
  target_roles text[] DEFAULT '{}'::text[],
  dream_companies text,
  weekly_prep_hours integer DEFAULT 10,
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.placement_profiles TO authenticated;
GRANT ALL ON public.placement_profiles TO service_role;
ALTER TABLE public.placement_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own placement profile" ON public.placement_profiles FOR ALL
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER tg_placement_profiles_updated
  BEFORE UPDATE ON public.placement_profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- Assessments: AI-generated readiness snapshot per user (latest wins)
CREATE TABLE public.placement_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  readiness_score integer NOT NULL,
  verdict text NOT NULL,
  summary text NOT NULL,
  category_scores jsonb NOT NULL,
  strengths text[] NOT NULL DEFAULT '{}',
  gaps text[] NOT NULL DEFAULT '{}',
  suggestions jsonb NOT NULL,
  roadmap jsonb NOT NULL,
  recommended_roles jsonb NOT NULL,
  predicted_companies text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.placement_assessments TO authenticated;
GRANT ALL ON public.placement_assessments TO service_role;
ALTER TABLE public.placement_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own assessments" ON public.placement_assessments FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_assessments_user_created ON public.placement_assessments(user_id, created_at DESC);

-- Roadmap task progress tracking
CREATE TABLE public.roadmap_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_key text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, task_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_progress TO authenticated;
GRANT ALL ON public.roadmap_progress TO service_role;
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roadmap progress" ON public.roadmap_progress FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER tg_roadmap_progress_updated
  BEFORE UPDATE ON public.roadmap_progress
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- Update handle_new_user to also seed placement_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.placement_profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();