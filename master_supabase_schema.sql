-- ===========================================================================
-- UNIFIED SUPABASE SCHEMA FOR SECOND SEMESTER NOTES HUB
-- ===========================================================================
-- Copy and paste this script into your Supabase SQL Editor (under SQL Editor -> New Query)
-- and click Run. It sets up all necessary tables, Row-Level Security (RLS) policies,
-- profile creation triggers, and helper functions for all subject websites.
-- ===========================================================================

-- 1. Shareable User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Chemistry: User Settings
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  last_opened_topic TEXT DEFAULT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Chemistry: Topic Progress
CREATE TABLE IF NOT EXISTS public.user_topic_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed', 'revision_needed')),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT user_topic_progress_user_topic_unique UNIQUE (user_id, topic_id)
);

-- 4. Chemistry: Bookmarks
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT user_bookmarks_user_topic_unique UNIQUE (user_id, topic_id)
);

-- 5. Chemistry: Personal Study Notes
CREATE TABLE IF NOT EXISTS public.user_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id TEXT NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT user_notes_user_topic_unique UNIQUE (user_id, topic_id)
);

-- 6. Mathematics: Syllabus Progress
CREATE TABLE IF NOT EXISTS public.syllabus_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  unit_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Completed', 'In Progress', 'Pending')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_user_unit UNIQUE (user_id, unit_id)
);

-- 7. Mathematics: Quiz History
CREATE TABLE IF NOT EXISTS public.quiz_history (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  questions JSONB NOT NULL,
  created_at BIGINT NOT NULL
);

-- 8. Mathematics: Revision Progress
CREATE TABLE IF NOT EXISTS public.revision_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_user_session UNIQUE (user_id, session_id)
);

-- ===========================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ===========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_progress ENABLE ROW LEVEL SECURITY;

-- ===========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===========================================================================

-- Profiles
CREATE POLICY "Allow users to select their own profile" 
  ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Allow users to insert their own profile" 
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow users to update their own profile" 
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- User Settings (Chemistry)
CREATE POLICY "Users can view their own settings" 
  ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" 
  ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" 
  ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Topic Progress (Chemistry)
CREATE POLICY "Users can manage their own topic progress" 
  ON public.user_topic_progress FOR ALL USING (auth.uid() = user_id);

-- Bookmarks (Chemistry)
CREATE POLICY "Users can manage their own bookmarks" 
  ON public.user_bookmarks FOR ALL USING (auth.uid() = user_id);

-- Notes (Chemistry)
CREATE POLICY "Users can manage their own notes" 
  ON public.user_notes FOR ALL USING (auth.uid() = user_id);

-- Syllabus Progress (Mathematics)
CREATE POLICY "Allow users to manage their own progress" 
  ON public.syllabus_progress FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Quiz History (Mathematics)
CREATE POLICY "Allow users to select their own quiz history" 
  ON public.quiz_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow users to insert their own quiz history" 
  ON public.quiz_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own quiz history" 
  ON public.quiz_history FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Revision Progress (Mathematics)
CREATE POLICY "Allow users to manage their own revision progress" 
  ON public.revision_progress FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ===========================================================================
-- AUTOMATED USER SIGNUP TRIGGERS & RPC HELPERS
-- ===========================================================================

-- Trigger to automatically create profile and settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, dob, college, year, semester)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    (new.raw_user_meta_data->>'dob')::DATE,
    COALESCE(new.raw_user_meta_data->>'college', ''),
    COALESCE(new.raw_user_meta_data->>'year', ''),
    COALESCE(new.raw_user_meta_data->>'semester', '')
  );
  
  INSERT INTO public.user_settings (user_id, theme)
  VALUES (new.id, 'dark');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Delete User Account RPC Function
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS VOID AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================================================
-- NEW PROFILE FIELDS & ADDITIONAL TABLES
-- ===========================================================================

-- 1. Add extra columns to profiles table if they do not exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS year TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS semester TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_session_id TEXT;

-- Enable Realtime publication for profiles (for single-active-device session lock)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;

-- 2. Create study history tracking table
CREATE TABLE IF NOT EXISTS public.study_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id TEXT NOT NULL,
  subject_title TEXT NOT NULL,
  topic_title TEXT DEFAULT NULL,
  url TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.study_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage their own study history"
  ON public.study_history FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 3. Create MAKAUT notices table
CREATE TABLE IF NOT EXISTS public.makaut_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  published_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  link TEXT DEFAULT NULL
);

ALTER TABLE public.makaut_notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to anyone"
  ON public.makaut_notices FOR SELECT TO anon, authenticated USING (true);

