-- ============================================================================
-- SMADAP POINER - Counseling Records & Point Reduction Audit Schema
-- Date: 2026-11-04
-- Description:
--   1. Creates `public.counseling_records` for BK counseling logs & point reductions.
--   2. Maintains strict audit trail with previous_points, resulting_points, evidence_notes.
--   3. Enforces point_reduction >= 0 and resulting_points >= 0 constraints.
--   4. Preserves all existing violation records in `student_violations` table.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.counseling_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    counselor_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    counselor_name VARCHAR(255) NOT NULL,
    counseling_type VARCHAR(100) NOT NULL DEFAULT 'Bimbingan Kedisiplinan',
    description TEXT NOT NULL,
    counseling_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    point_reduction INT NOT NULL DEFAULT 0,
    reduction_reason TEXT,
    evidence_notes TEXT,
    previous_points INT NOT NULL DEFAULT 0,
    resulting_points INT NOT NULL DEFAULT 0,
    action_taken VARCHAR(100) NOT NULL DEFAULT 'Bimbingan Konseling',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_counseling_point_reduction CHECK (point_reduction >= 0),
    CONSTRAINT chk_counseling_resulting_points CHECK (resulting_points >= 0)
);

-- Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_counseling_student
    ON public.counseling_records(student_id);

CREATE INDEX IF NOT EXISTS idx_counseling_counselor
    ON public.counseling_records(counselor_id);

CREATE INDEX IF NOT EXISTS idx_counseling_date
    ON public.counseling_records(counseling_date DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.counseling_records ENABLE ROW LEVEL SECURITY;

-- Policies:
-- 1. Counselors (Guru BK), Admins, and the Student themselves can read counseling records
DROP POLICY IF EXISTS "Counselors and admins can view counseling records" ON public.counseling_records;
CREATE POLICY "Counselors and admins can view counseling records"
    ON public.counseling_records
    FOR SELECT
    TO authenticated
    USING (
        student_id IN (
            SELECT id FROM public.students WHERE profile_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.teachers t
            WHERE t.profile_id = auth.uid()
              AND (t.teacher_type = 'counselor' OR t.specialization = 'guru_bk')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.role = 'admin'
        )
    );

-- 2. Counselors & Admins can insert counseling records
DROP POLICY IF EXISTS "Counselors and admins can insert counseling records" ON public.counseling_records;
CREATE POLICY "Counselors and admins can insert counseling records"
    ON public.counseling_records
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.teachers t
            WHERE t.profile_id = auth.uid()
              AND (t.teacher_type = 'counselor' OR t.specialization = 'guru_bk')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.role = 'admin'
        )
    );

COMMIT;
