-- =============================================================================
-- Migration: 20261109_cleanup_seeded_demo_violations.sql
-- Purpose:
--   1. Delete the 396 batch-seeded demo violation records inserted on
--      2026-11-04T02:46:08Z while preserving all legitimate teacher-created
--      violation records, student records, and merit records.
--   2. Recalculate students.total_violation_points strictly from authentic
--      confirmed violation logs in public.student_violations.
-- =============================================================================

BEGIN;

-- 1. Delete only the 396 batch-seeded demo records in public.student_violations
DELETE FROM public.student_violations
WHERE created_at >= '2026-11-04T02:46:08.000000+00:00'
  AND created_at <  '2026-11-04T02:46:09.000000+00:00'
  AND notes IN (
    'Terlambat hadir',
    'Atribut tidak lengkap',
    'Rambut tidak rapi',
    'Tidak masuk tanpa keterangan',
    'Membawa HP saat pelajaran',
    'Keluar kelas tanpa izin'
  );

-- 2. Recalculate total_violation_points for all students based exclusively on authentic records
UPDATE public.students s
SET total_violation_points = COALESCE(
  (
    SELECT SUM(sv.points)
    FROM public.student_violations sv
    WHERE sv.student_id = s.id
      AND COALESCE(sv.status, 'confirmed') <> 'cancelled'
  ),
  0
);

COMMIT;
