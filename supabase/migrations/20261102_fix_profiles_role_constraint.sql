-- ============================================================================
-- Fix: Update profiles role check constraint & normalize role trigger
-- Allow 'admin', 'teacher', 'student', 'guru', 'siswa'
-- ============================================================================

-- 1. Drop existing constraint and recreate with extended role support
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_profiles_role;

ALTER TABLE public.profiles
ADD CONSTRAINT chk_profiles_role
CHECK (role IN ('admin', 'teacher', 'student', 'guru', 'siswa'));

-- 2. Update handle_new_user trigger function to map guru -> teacher, siswa -> student
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role VARCHAR;
  raw_role VARCHAR;
BEGIN
  raw_role := LOWER(COALESCE(new.raw_user_meta_data->>'role', 'student'));
  
  IF raw_role IN ('guru', 'teacher') THEN
    v_role := 'teacher';
  ELSIF raw_role IN ('siswa', 'student') THEN
    v_role := 'student';
  ELSIF raw_role = 'admin' THEN
    v_role := 'admin';
  ELSE
    v_role := 'student';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    v_role
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = NOW();

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
