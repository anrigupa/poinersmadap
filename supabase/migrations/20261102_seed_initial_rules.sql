-- ============================================================================
-- SMADAP POINER - Seed Initial Master Data
-- Categories & Common School Rules (SMAN 2 PANGKEP)
-- ============================================================================

-- 1. Insert Violation Categories
INSERT INTO public.violation_categories (id, name, severity_level, description, color_code)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Kedisiplinan & Waktu', 1, 'Pelanggaran terkait kehadiran, keterlambatan, dan atribut sekolah.', '#3b82f6'),
  ('22222222-2222-2222-2222-222222222222', 'Kerapian & Seragam', 1, 'Pelanggaran kelengkapan seragam, model rambut, dan penampilan.', '#10b981'),
  ('33333333-3333-3333-3333-333333333333', 'Etika & Perilaku', 2, 'Pelanggaran kesopanan, perusakan fasilitas, dan gangguan ketertiban.', '#f59e0b'),
  ('44444444-4444-4444-4444-444444444444', 'Pelanggaran Berat & Pidana', 3, 'Perkelahian, narkoba, judi, pemerasan, dan pelanggaran hukum.', '#ef4444')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Violation Types / Rules Catalog
INSERT INTO public.violation_types (category_id, code, name, description, points, sanction_recommendation, is_active)
VALUES
  -- Kategori: Kedisiplinan & Waktu
  ('11111111-1111-1111-1111-111111111111', 'DIS-01', 'Terlambat Masuk Sekolah', 'Hadir ke sekolah setelah gerbang ditutup (lewat jam 07.15 WIB)', 5, 'Peringatan lisan dan pembinaan piket', true),
  ('11111111-1111-1111-1111-111111111111', 'DIS-02', 'Keluar Kelas Tanpa Izin', 'Meninggalkan jam pelajaran berlangsung tanpa kartu izin guru', 10, 'Tugas mandiri di perpustakaan', true),
  ('11111111-1111-1111-1111-111111111111', 'DIS-03', 'Membolos / Tidak Masuk Tanpa Keterangan', 'Tidak hadir ke sekolah tanpa surat izin resmi atau kabur saat jam sekolah', 20, 'Pemanggilan orang tua oleh wali kelas', true),

  -- Kategori: Kerapian & Seragam
  ('22222222-2222-2222-2222-222222222222', 'RPA-01', 'Atribut Seragam Tidak Lengkap', 'Tidak mengenakan dasi, topi upacara, atau kaos kaki sesuai ketentuan', 5, 'Peringatan lisan dan pembenahan atribut', true),
  ('22222222-2222-2222-2222-222222222222', 'RPA-02', 'Rambut Tidak Sesuai Ketentuan (Putra)', 'Panjang rambut melebihi batas kerah/telinga atau dicat warna-warni', 10, 'Pembinaan dan wajib potong rapi dalam 2 hari', true),

  -- Kategori: Etika & Perilaku
  ('33333333-3333-3333-3333-333333333333', 'ETK-01', 'Menggunakan HP Saat KBM Tanpa Izin', 'Bermain game, media sosial, atau menonton video di waktu belajar', 10, 'Penyitaan HP hingga jam pulang sekolah', true),
  ('33333333-3333-3333-3333-333333333333', 'ETK-02', 'Merusak Fasilitas Sekolah', 'Mencoret meja/dinding atau merusak sarana prasarana sekolah', 25, 'Perbaikan fasilitas & konseling Guru BK', true),

  -- Kategori: Pelanggaran Berat
  ('44444444-4444-4444-4444-444444444444', 'BRT-01', 'Merokok / Vape di Lingkungan Sekolah', 'Membawa, menyimpan, atau menghisap rokok/vape di area sekolah/seragam sekolah', 40, 'SP1 & pemanggilan orang tua ke sekolah', true),
  ('44444444-4444-4444-4444-444444444444', 'BRT-02', 'Terlibat Perkelahian / Tawuran', 'Melakukan kekerasan fisik antar sesama siswa di dalam atau luar sekolah', 75, 'SP2 / Skorsing & sidang dewan guru', true)
ON CONFLICT (code) DO NOTHING;
