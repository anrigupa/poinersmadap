-- Migration: Harden automatic profile creation trigger
-- Purpose:
-- Ensure handle_new_user() ONLY provisions a profile during initial signup/account creation (AFTER INSERT on auth.users).
-- It must NEVER recreate profiles for deleted accounts or during signInWithPassword().
-- It strictly respects server-provided role in raw_app_meta_data.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Only insert if row does not already exist
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(
      CASE
        WHEN new.raw_app_meta_data->>'role' IN ('admin', 'teacher', 'student', 'guru', 'siswa')
        THEN new.raw_app_meta_data->>'role'
        ELSE NULL
      END,
      'siswa'
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-assert trigger strictly AFTER INSERT only (never on UPDATE or login events)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
