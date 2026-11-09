-- ============================================================================
-- SMADAP POINER - Academic Year Management & System Settings
-- Table: public.academic_settings
-- Fields: id, academic_year, semester, is_active, created_at, updated_at
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.academic_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year VARCHAR(20) NOT NULL,
    semester VARCHAR(10) NOT NULL DEFAULT 'Ganjil',
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_academic_year_semester UNIQUE (academic_year, semester),
    CONSTRAINT chk_semester_valid CHECK (
        semester IN ('Ganjil', 'Genap')
    )
);

-- Partial unique index guaranteeing at most ONE active academic year across the entire table
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_active_academic_year
    ON public.academic_settings (is_active)
    WHERE is_active = TRUE;

-- Trigger function to automatically deactivate other academic years when one is set active
CREATE OR REPLACE FUNCTION public.fn_enforce_single_active_academic_year()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = TRUE THEN
        UPDATE public.academic_settings
        SET is_active = FALSE,
            updated_at = NOW()
        WHERE id <> NEW.id
          AND is_active = TRUE;
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_single_active_academic_year ON public.academic_settings;
CREATE TRIGGER trg_enforce_single_active_academic_year
    BEFORE INSERT OR UPDATE ON public.academic_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_enforce_single_active_academic_year();

-- Enable RLS (Only Admin can modify, all authenticated users can read active period)
ALTER TABLE public.academic_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to academic_settings for all" ON public.academic_settings;
CREATE POLICY "Allow read access to academic_settings for all"
    ON public.academic_settings
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow admin full access to academic_settings" ON public.academic_settings;
CREATE POLICY "Allow admin full access to academic_settings"
    ON public.academic_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

-- Seed initial Academic Year history & active period
INSERT INTO public.academic_settings (academic_year, semester, is_active, created_at, updated_at)
VALUES
    ('2024/2025', 'Ganjil', FALSE, '2024-07-01T08:00:00Z', '2024-12-20T16:00:00Z'),
    ('2024/2025', 'Genap',  FALSE, '2025-01-06T08:00:00Z', '2025-06-21T16:00:00Z'),
    ('2025/2026', 'Ganjil', FALSE, '2025-07-07T08:00:00Z', '2025-12-19T16:00:00Z'),
    ('2025/2026', 'Genap',  FALSE, '2026-01-05T08:00:00Z', '2026-06-20T16:00:00Z'),
    ('2026/2027', 'Ganjil', TRUE,  '2026-07-06T08:00:00Z', NOW()),
    ('2026/2027', 'Genap',  FALSE, '2026-07-06T08:00:00Z', NOW()),
    ('2027/2028', 'Ganjil', FALSE, NOW(), NOW()),
    ('2028/2029', 'Ganjil', FALSE, NOW(), NOW()),
    ('2029/2030', 'Ganjil', FALSE, NOW(), NOW())
ON CONFLICT (academic_year, semester) DO NOTHING;
