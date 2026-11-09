-- ============================================================================
-- SMADAP POINER - Student Merits & Point Reduction (Pemutihan Poin) Schema
-- Date: 2026-11-05
-- Description:
--   1. Creates `public.student_merits` table for achievements & positive behaviors.
--   2. Supports categories: Akademik, Ekstrakurikuler, Tahfidz, OSIS, Paskibra, Keagamaan, Sosial.
--   3. Tracks verification workflow: pending -> approved / rejected (Admin & Guru BK).
--   4. Creates `public.merit_deductions` table for traceable point redemption audit.
--   5. Implements RLS: Students can view their achievements and submit new ones;
--      Admins & Teachers can view and verify submissions.
--   6. Enforces non-negative point balances and preserves violation records permanently.
-- ============================================================================

BEGIN;

-- 1. Create Student Merits / Achievements Table
CREATE TABLE IF NOT EXISTS public.student_merits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    achievement_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    evidence_url TEXT,
    merit_points INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    submission_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_student_merits_points CHECK (merit_points >= 0),
    CONSTRAINT chk_student_merits_status CHECK (status IN ('pending', 'approved', 'rejected')),
    CONSTRAINT chk_student_merits_category CHECK (
        category IN ('Akademik', 'Ekstrakurikuler', 'Tahfidz', 'OSIS', 'Paskibra', 'Keagamaan', 'Sosial')
    )
);

-- 2. Create Merit Point Deductions (Pemutihan Audit Log) Table
CREATE TABLE IF NOT EXISTS public.merit_deductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    merit_id UUID REFERENCES public.student_merits(id) ON DELETE SET NULL,
    deduction_reason TEXT NOT NULL,
    original_points INT NOT NULL DEFAULT 0,
    reduction_points INT NOT NULL DEFAULT 0,
    remaining_points INT NOT NULL DEFAULT 0,
    approved_by VARCHAR(255) NOT NULL DEFAULT 'Guru BK / Admin',
    deduction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_merit_deductions_positive CHECK (reduction_points > 0),
    CONSTRAINT chk_merit_deductions_remaining CHECK (remaining_points >= 0)
);

-- 3. Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_student_merits_student
    ON public.student_merits(student_id);

CREATE INDEX IF NOT EXISTS idx_student_merits_status
    ON public.student_merits(status);

CREATE INDEX IF NOT EXISTS idx_student_merits_date
    ON public.student_merits(submission_date DESC);

CREATE INDEX IF NOT EXISTS idx_merit_deductions_student
    ON public.merit_deductions(student_id);

CREATE INDEX IF NOT EXISTS idx_merit_deductions_date
    ON public.merit_deductions(deduction_date DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.student_merits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merit_deductions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for student_merits
-- Students can read their own achievements
DROP POLICY IF EXISTS "Students can view own merits" ON public.student_merits;
CREATE POLICY "Students can view own merits"
    ON public.student_merits
    FOR SELECT
    TO authenticated
    USING (
        student_id IN (
            SELECT id FROM public.students WHERE profile_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND (p.role IN ('admin', 'teacher', 'guru'))
        )
    );

-- Students can insert achievements for themselves (must start as status='pending', merit_points=0)
DROP POLICY IF EXISTS "Students can submit merits" ON public.student_merits;
CREATE POLICY "Students can submit merits"
    ON public.student_merits
    FOR INSERT
    TO authenticated
    WITH CHECK (
        (
            student_id IN (
                SELECT id FROM public.students WHERE profile_id = auth.uid()
            )
            AND status = 'pending'
            AND merit_points = 0
            AND verified_by IS NULL
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

-- Only Admin or BK Teachers (Counselors) can update (verify/approve/reject) achievements
DROP POLICY IF EXISTS "Staff can verify merits" ON public.student_merits;
CREATE POLICY "Staff can verify merits"
    ON public.student_merits
    FOR UPDATE
    TO authenticated
    USING (
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
    )
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

-- 6. RLS Policies for merit_deductions
DROP POLICY IF EXISTS "Students can view own deductions" ON public.merit_deductions;
CREATE POLICY "Students can view own deductions"
    ON public.merit_deductions
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

DROP POLICY IF EXISTS "Counselors and admins can insert deductions" ON public.merit_deductions;
CREATE POLICY "Counselors and admins can insert deductions"
    ON public.merit_deductions
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
