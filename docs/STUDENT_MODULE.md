# Dokumentasi Modul Siswa: SMADAP POINER

**Institusi:** SMAN 2 PANGKEP  
**Modul:** Portal & Dashboard Siswa (`/siswa`) & Prestasi & Pemutihan (`/siswa/merits`)  
**Versi Dokumen:** 1.2.0  
**Pembaruan Terakhir:** 5 November 2026  
**Status Implementasi:** ✅ Aktif, Teruji, & Terintegrasi Penuh

---

## 1. Ringkasan & Filosofi Modul

Modul Siswa pada SMADAP POINER dirancang dengan pendekatan **Restorative Discipline (Kedisiplinan Restoratif)** dan **Unified Disciplinary Card (Satu Pintu Kartu Disiplin)**:
1. **Dasbor Kedisiplinan (`/siswa`):** Seluruh informasi rekam jejak kedisiplinan siswa—profil biodata, status level sanksi (`Aman`, `SP1`, `SP2`, `SP3`), grafik tren bulanan, serta catatan riwayat pelanggaran—disajikan secara terpadu di halaman dasbor utama.
2. **Prestasi & Pemutihan (`/siswa/merits`):** Portal resmi bagi peserta didik untuk mencatat prestasi, memantau saldo poin prestasi, mengajukan pemutihan poin pelanggaran, serta meninjau audit trail pemotongan poin tanpa pernah menghapus rekam jejak pelanggaran historis.

---

## 2. Modul Prestasi & Pemutihan (`/siswa/merits`)

Rute `/siswa/merits` mengimplementasikan 5 seksi utama sesuai spesifikasi roadmap sistem:

### 2.1 Seksi 1: Prestasi Saya
Menampilkan seluruh riwayat prestasi yang telah diajukan siswa dengan atribut:
- **Nama Prestasi:** Judul kejuaraan atau capaian (contoh: *Juara 1 Lomba Debat Bahasa Indonesia*).
- **Kategori Prestasi:**
  - `Akademik` (Olimpiade Sains, Debat, Karya Tulis Ilmiah)
  - `Ekstrakurikuler` (Olahraga, Seni Musik/Tari, PMR, Pramuka)
  - `Tahfidz` (Hafalan Al-Qur'an & Tasmi')
  - `OSIS` (Kepengurusan & Kepanitiaan Inti)
  - `Paskibra` (Pengibar Bendera Sekolah & Daerah)
  - `Keagamaan` (Rohis, Da'i Remaja, MTQ)
  - `Sosial` (Bakti Lingkungan, Donor Darah, Relawan)
- **Tanggal Diajukan & Waktu Verifikasi** (Format WITA).
- **Poin Merit:** Nilai poin penghargaan yang ditambahkan ke saldo setelah diverifikasi.
- **Status Verifikasi:**
  - `Pending` (Kuning/Amber) — Menunggu tinjauan Admin/Guru BK
  - `Approved` (Hijau/Emerald) — Terverifikasi & poin aktif
  - `Rejected` (Merah/Rose) — Ditolak disertai alasan

### 2.2 Seksi 2: Saldo Prestasi
Kartu analitik saldo poin penghargaan prestasi:
- **Total Poin Prestasi:** Akumulasi seluruh poin dari prestasi berstatus `Approved`.
- **Poin Terpakai (Diputihkan):** Poin prestasi yang telah dikonversi untuk pemutihan poin pelanggaran.
- **Saldo Tersedia:** Poin prestasi aktif yang siap digunakan (`Saldo Tersedia = Total Poin Prestasi - Poin Terpakai >= 0`).
- **Aksi Konversi:** Tombol interaktif untuk membuka dialog konversi pemutihan poin dengan kalkulasi simulasi instan.

### 2.3 Seksi 3: Riwayat Pemutihan (Traceable Audit Trail)
Menyajikan tabel log audit resmi seluruh pengurangan poin kedisiplinan:
- **Tanggal:** Waktu pelaksanaan pemutihan/konseling.
- **Pelanggaran / Alasan Pemutihan:** Keterangan latar belakang konversi poin atau kegiatan pembinaan budi pekerti.
- **Poin Awal (Original Points):** Akumulasi poin sebelum pemutihan.
- **Poin Pemutihan (Reduction Points):** Besaran poin yang dikurangi (`-X Poin`).
- **Sisa Poin (Remaining Points):** Poin akhir setelah pemotongan.
- **Disetujui Oleh (Approved By):** Nama Guru BK atau Administrator yang memverifikasi.

### 2.4 Seksi 4: Status Disiplin & Formula Kedisiplinan
Panel status kepatuhan tata tertib dengan visualisasi progress bar dan formula deterministik:
$$\text{Effective Discipline Points} = \max(0, \text{Total Violation Points} - \text{Total Reduction Points})$$
- **Total Poin Pelanggaran:** Akumulasi seluruh bobot pelanggaran yang tercatat di tabel `student_violations`.
- **Total Poin Pemutihan:** Akumulasi seluruh pemotongan poin yang disetujui.
- **Poin Disiplin Efektif:** Poin aktif yang menentukan status sanksi siswa saat ini (`Aman`, `SP1`, `SP2`, `SP3`).
- **Aturan Non-Negatif:** Poin efektif tidak dapat bernilai negatif.
- **Integritas Arsip:** Catatan pelanggaran masa lalu di `student_violations` tidak pernah dihapus guna keperluan audit sekolah dan penerbitan Surat Peringatan.

### 2.5 Seksi 5: Pengajuan Prestasi Siswa
Formulir pengajuan prestasi mandiri bagi siswa:
- **Input:** Nama Prestasi, Kategori (Dropdown 7 Kategori), Deskripsi Kegiatan/Penyelenggara, Tautan Bukti Berkas (Google Drive / Piagam / URL).
- **Alur Kerja:** Status otomatis disetel ke `Pending`. Otoritas verifikasi dan penetapan poin penghargaan eksklusif dimiliki oleh **Administrator** dan **Guru BK**.

---

## 3. Arsitektur Navigasi Portal Siswa

### 3.1 Struktur Menu Desktop Sidebar (`ROLE_NAVIGATION.siswa`)
```
┌────────────────────────────────────────────────────────┐
│  PORTAL AKSES: SISWA                                  │
├────────────────────────────────────────────────────────┤
│  MENU UTAMA                                            │
│  📊 Kartu Disiplin                 (/siswa)           │
├────────────────────────────────────────────────────────┤
│  PENGEMBANGAN DIRI                                     │
│  🏆 Prestasi & Pemutihan Poin      (/siswa/merits)     │
│  📖 Buku Saku Digital              (/rules)            │
├────────────────────────────────────────────────────────┤
│  INFO SISTEM                                           │
│  Tahun Ajaran Aktif & Semester                         │
└────────────────────────────────────────────────────────┘
```

### 3.2 Struktur Mobile Bottom Navigation (`MOBILE_BOTTOM_NAV.siswa`)
1. **Kartu Disiplin** (`/siswa`) — Ikon `LayoutDashboard`
2. **Prestasi** (`/siswa/merits`) — Ikon `Award`
3. **Buku Saku** (`/rules`) — Ikon `BookOpen`

---

## 4. Keamanan & Skema Basis Data

1. **Proteksi Rute:**  
   Rute `/siswa/merits` diproteksi menggunakan [`requireRole(["siswa", "admin"], "/siswa/merits")`](file:///home/anrigupa/Desktop/poiner/src/lib/security/guards.ts).
2. **Skema PostgreSQL:**
   - Tabel `public.student_merits`: Menyimpan rekam capaian siswa, kategori, bukti, poin penghargaan, dan status verifikasi.
   - Tabel `public.merit_deductions` / `public.counseling_records`: Menyimpan rekam jejak audit pengurangan poin.
   - Kolom `students.total_merit_points` & `students.total_violation_points`: Terbarui secara tersinkronisasi saat pemutihan terjadi.
3. **Penolakan Penghapusan:**  
   Sistem secara ketat melarang perintah `DELETE` pada tabel `student_violations`.
