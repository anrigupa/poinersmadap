-- ============================================================================
-- SMADAP POINER - Complete Database Schema & Tables Initialization
-- Architecture: Next.js 15 App Router + Supabase Auth / PostgreSQL
-- Date: 2026-11-02
--
-- Instructions:
-- 1. Run this file FIRST in Supabase SQL Editor to create all tables and indexes.
-- 2. Then run 20261102_security_rls_layer.sql to apply Row Level Security.
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Profiles Table (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    avatar_url TEXT,
    phone_number VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_profiles_role CHECK (role IN ('admin', 'teacher', 'student', 'guru', 'siswa')),
    CONSTRAINT chk_profiles_email_not_empty CHECK (length(trim(email)) > 3)
);

-- 3. Create Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    nis VARCHAR(20) NOT NULL UNIQUE,
    nisn VARCHAR(20) UNIQUE,
    class_name VARCHAR(50) NOT NULL,
    gender VARCHAR(1) NOT NULL DEFAULT 'L',
    parent_name VARCHAR(255),
    parent_phone VARCHAR(20),
    total_violation_points INT NOT NULL DEFAULT 0,
    total_merit_points INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_students_points_non_negative CHECK (total_violation_points >= 0 AND total_merit_points >= 0),
    CONSTRAINT chk_students_status CHECK (status IN ('active', 'sp1', 'sp2', 'sp3', 'suspended', 'expelled')),
    CONSTRAINT chk_students_gender CHECK (gender IN ('L', 'P'))
);

-- 4. Create Teachers Table
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    nip VARCHAR(30) NOT NULL UNIQUE,
    teacher_type VARCHAR(20) NOT NULL DEFAULT 'teacher',
    specialization VARCHAR(30) NOT NULL DEFAULT 'guru_piket',
    assigned_class VARCHAR(50),
    phone_number VARCHAR(25),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_teachers_teacher_type CHECK (teacher_type IN ('teacher', 'counselor')),
    CONSTRAINT chk_teachers_specialization CHECK (specialization IN ('guru_piket', 'wali_kelas', 'guru_bk', 'guru_mapel'))
);

-- 5. Create Violation Categories Table
CREATE TABLE IF NOT EXISTS public.violation_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    severity_level INT NOT NULL,
    description TEXT,
    color_code VARCHAR(20) DEFAULT '#f59e0b',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_violation_categories_severity CHECK (severity_level IN (1, 2, 3))
);

-- 6. Create Violation Types / Catalog Table
CREATE TABLE IF NOT EXISTS public.violation_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.violation_categories(id) ON DELETE RESTRICT,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    points INT NOT NULL,
    sanction_recommendation TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_violation_types_points CHECK (points > 0)
);

-- 7. Create Student Violations Table
CREATE TABLE IF NOT EXISTS public.student_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    violation_type_id UUID NOT NULL REFERENCES public.violation_types(id) ON DELETE RESTRICT,
    reported_by UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    points INT NOT NULL,
    notes TEXT,
    evidence_url TEXT,
    incident_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_student_violations_points CHECK (points > 0),
    CONSTRAINT chk_student_violations_status CHECK (status IN ('confirmed', 'appealed', 'cancelled'))
);

-- 8. Create Performance & Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

CREATE INDEX IF NOT EXISTS idx_students_nis ON public.students(nis);
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(class_name);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_students_points ON public.students(total_violation_points DESC);

CREATE INDEX IF NOT EXISTS idx_teachers_nip ON public.teachers(nip);
CREATE INDEX IF NOT EXISTS idx_teachers_specialization ON public.teachers(specialization);

CREATE INDEX IF NOT EXISTS idx_violation_types_category ON public.violation_types(category_id);
CREATE INDEX IF NOT EXISTS idx_violation_types_code ON public.violation_types(code);
CREATE INDEX IF NOT EXISTS idx_violation_types_active ON public.violation_types(is_active);

CREATE INDEX IF NOT EXISTS idx_violations_student_date ON public.student_violations(student_id, incident_date DESC);
CREATE INDEX IF NOT EXISTS idx_violations_reported_by ON public.student_violations(reported_by);
CREATE INDEX IF NOT EXISTS idx_violations_type ON public.student_violations(violation_type_id);
CREATE INDEX IF NOT EXISTS idx_violations_status ON public.student_violations(status);

-- 9. Automatic Profile Creation on Supabase Auth Signup (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
