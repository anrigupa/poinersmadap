-- ============================================================================
-- SMADAP POINER - Complete Database Row-Level Security (RLS) Layer
-- Architecture: Next.js 15 App Router + Supabase Auth / PostgreSQL
-- Date: 2026-11-02
--
-- Security Matrix:
--   Role 'admin'   : Full access across all entities.
--   Role 'teacher' : Create violations, Read own submissions only, Read students/rules.
--   Role 'student' : Read own student record and own violation incidents only.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Helper Functions in schema 'public' / 'auth'
-- ----------------------------------------------------------------------------

-- Function to extract authenticated user's role from public.profiles
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS VARCHAR AS $$
DECLARE
  v_role VARCHAR;
BEGIN
  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = auth.uid();
  RETURN COALESCE(v_role, 'student');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to resolve authenticated user's student record ID
CREATE OR REPLACE FUNCTION public.get_auth_student_id()
RETURNS UUID AS $$
DECLARE
  v_student_id UUID;
BEGIN
  SELECT id INTO v_student_id
  FROM public.students
  WHERE profile_id = auth.uid();
  RETURN v_student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to resolve authenticated user's teacher record ID
CREATE OR REPLACE FUNCTION public.get_auth_teacher_id()
RETURNS UUID AS $$
DECLARE
  v_teacher_id UUID;
BEGIN
  SELECT id INTO v_teacher_id
  FROM public.teachers
  WHERE profile_id = auth.uid();
  RETURN v_teacher_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ----------------------------------------------------------------------------
-- 2. Enable RLS on All Tables
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violation_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_violations ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. PROFILES Table RLS Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_admin_full_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_teacher_read_students" ON public.profiles;

-- Admin: Full access
CREATE POLICY "profiles_admin_full_access"
ON public.profiles
FOR ALL
TO authenticated
USING (public.get_auth_role() = 'admin')
WITH CHECK (public.get_auth_role() = 'admin');

-- Authenticated: Read own profile
CREATE POLICY "profiles_read_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Teacher: Read student profiles (required for autocomplete & search combobox)
CREATE POLICY "profiles_teacher_read_students"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.get_auth_role() IN ('teacher', 'guru') AND role = 'siswa'
);

-- ----------------------------------------------------------------------------
-- 4. STUDENTS Table RLS Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "students_admin_full_access" ON public.students;
DROP POLICY IF EXISTS "students_teacher_select" ON public.students;
DROP POLICY IF EXISTS "students_read_own" ON public.students;

-- Admin: Full access
CREATE POLICY "students_admin_full_access"
ON public.students
FOR ALL
TO authenticated
USING (public.get_auth_role() = 'admin')
WITH CHECK (public.get_auth_role() = 'admin');

-- Teacher: Can view all students (needed for reporting and counseling)
CREATE POLICY "students_teacher_select"
ON public.students
FOR SELECT
TO authenticated
USING (public.get_auth_role() IN ('teacher', 'guru'));

-- Student: Can view ONLY their own student record
CREATE POLICY "students_read_own"
ON public.students
FOR SELECT
TO authenticated
USING (profile_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5. TEACHERS Table RLS Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "teachers_admin_full_access" ON public.teachers;
DROP POLICY IF EXISTS "teachers_authenticated_select" ON public.teachers;

-- Admin: Full access
CREATE POLICY "teachers_admin_full_access"
ON public.teachers
FOR ALL
TO authenticated
USING (public.get_auth_role() = 'admin')
WITH CHECK (public.get_auth_role() = 'admin');

-- Authenticated: Can view basic teacher details (for reporter name display)
CREATE POLICY "teachers_authenticated_select"
ON public.teachers
FOR SELECT
TO authenticated
USING (true);

-- ----------------------------------------------------------------------------
-- 6. VIOLATION_CATEGORIES & VIOLATION_TYPES Table RLS Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "categories_admin_full_access" ON public.violation_categories;
DROP POLICY IF EXISTS "categories_public_select" ON public.violation_categories;
DROP POLICY IF EXISTS "types_admin_full_access" ON public.violation_types;
DROP POLICY IF EXISTS "types_public_select" ON public.violation_types;

-- Admin: Full CRUD
CREATE POLICY "categories_admin_full_access"
ON public.violation_categories
FOR ALL
TO authenticated
USING (public.get_auth_role() = 'admin')
WITH CHECK (public.get_auth_role() = 'admin');

-- Public & Authenticated: Read active categories
CREATE POLICY "categories_public_select"
ON public.violation_categories
FOR SELECT
TO public
USING (true);

-- Admin: Full CRUD on violation rules
CREATE POLICY "types_admin_full_access"
ON public.violation_types
FOR ALL
TO authenticated
USING (public.get_auth_role() = 'admin')
WITH CHECK (public.get_auth_role() = 'admin');

-- Public & Authenticated: Read active rules
CREATE POLICY "types_public_select"
ON public.violation_types
FOR SELECT
TO public
USING (is_active = true);

-- ----------------------------------------------------------------------------
-- 7. STUDENT_VIOLATIONS Table RLS Policies (CRITICAL ENFORCEMENT)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "violations_admin_full_access" ON public.student_violations;
DROP POLICY IF EXISTS "violations_teacher_insert" ON public.student_violations;
DROP POLICY IF EXISTS "violations_teacher_select_own" ON public.student_violations;
DROP POLICY IF EXISTS "violations_student_select_own" ON public.student_violations;

-- Admin: Full access to all violation records
CREATE POLICY "violations_admin_full_access"
ON public.student_violations
FOR ALL
TO authenticated
USING (public.get_auth_role() = 'admin')
WITH CHECK (public.get_auth_role() = 'admin');

-- Teacher: Can CREATE (insert) violation records
-- Enforces that reported_by must match the authenticated teacher's ID or profile ID
CREATE POLICY "violations_teacher_insert"
ON public.student_violations
FOR INSERT
TO authenticated
WITH CHECK (
  public.get_auth_role() IN ('teacher', 'guru') AND
  (reported_by = auth.uid() OR reported_by = public.get_auth_teacher_id())
);

-- Teacher: Can SELECT ONLY personal records (their own submissions)
CREATE POLICY "violations_teacher_select_own"
ON public.student_violations
FOR SELECT
TO authenticated
USING (
  public.get_auth_role() IN ('teacher', 'guru') AND
  (reported_by = auth.uid() OR reported_by = public.get_auth_teacher_id())
);

-- Student: Can SELECT ONLY records belonging to themselves
CREATE POLICY "violations_student_select_own"
ON public.student_violations
FOR SELECT
TO authenticated
USING (
  public.get_auth_role() IN ('student', 'siswa') AND
  student_id = public.get_auth_student_id()
);

-- ----------------------------------------------------------------------------
-- 8. Storage Buckets Security (violation-evidence)
-- ----------------------------------------------------------------------------
-- Teachers & Admins can upload photos; Students can view if attached to their record
INSERT INTO storage.buckets (id, name, public)
VALUES ('violation-evidence', 'violation-evidence', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "evidence_upload_teacher_admin" ON storage.objects;
DROP POLICY IF EXISTS "evidence_read_authenticated" ON storage.objects;

CREATE POLICY "evidence_upload_teacher_admin"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'violation-evidence' AND
  public.get_auth_role() IN ('admin', 'teacher', 'guru')
);

CREATE POLICY "evidence_read_authenticated"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'violation-evidence');
