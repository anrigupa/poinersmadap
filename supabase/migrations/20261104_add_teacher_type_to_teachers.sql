-- ============================================================================
-- SMADAP POINER - Add teacher_type and phone_number to public.teachers
-- Date: 2026-11-04
-- Description:
--   1. Safely adds `teacher_type` ('teacher' | 'counselor') to `public.teachers`.
--   2. Safely adds `phone_number` VARCHAR(25) to `public.teachers` and syncs from `public.profiles`.
--   3. Backfills existing `guru_bk` teachers to `teacher_type = 'counselor'`.
--   4. Expands `chk_teachers_specialization` to include `'guru_mapel'`.
--   5. Adds index on `teacher_type` for fast public "Lapor BK" counselor lookups.
-- ============================================================================

BEGIN;

-- 1. Add teacher_type and phone_number columns safely if they do not exist
ALTER TABLE public.teachers
    ADD COLUMN IF NOT EXISTS teacher_type VARCHAR(20) NOT NULL DEFAULT 'teacher',
    ADD COLUMN IF NOT EXISTS phone_number VARCHAR(25);

-- 2. Backfill phone_number from public.profiles if available
UPDATE public.teachers t
SET phone_number = p.phone_number,
    updated_at = NOW()
FROM public.profiles p
WHERE t.profile_id = p.id
  AND t.phone_number IS NULL
  AND p.phone_number IS NOT NULL;

-- 3. Backfill existing Counselor Teachers (Guru BK)
UPDATE public.teachers
SET teacher_type = 'counselor',
    updated_at = NOW()
WHERE specialization = 'guru_bk'
  AND teacher_type <> 'counselor';

-- 4. Safely replace specialization check constraint to include 'guru_mapel'
ALTER TABLE public.teachers
    DROP CONSTRAINT IF EXISTS chk_teachers_specialization;

ALTER TABLE public.teachers
    ADD CONSTRAINT chk_teachers_specialization
    CHECK (specialization IN ('guru_piket', 'wali_kelas', 'guru_bk', 'guru_mapel'));

-- 5. Safely add teacher_type check constraint ('teacher' | 'counselor')
ALTER TABLE public.teachers
    DROP CONSTRAINT IF EXISTS chk_teachers_teacher_type;

ALTER TABLE public.teachers
    ADD CONSTRAINT chk_teachers_teacher_type
    CHECK (teacher_type IN ('teacher', 'counselor'));

-- 6. Create lookup index for teacher_type
CREATE INDEX IF NOT EXISTS idx_teachers_teacher_type
    ON public.teachers(teacher_type);

COMMIT;
