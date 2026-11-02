# SI-DISIPLIN - Aplikasi Web Sistem Poin Pelanggaran Siswa (Tahap 1: Landing Page)

Proyek ini dibangun menggunakan **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, dan **Framer Motion** sesuai tata letak dan koreografi animasi referensi.

## Fitur yang Sudah Tersedia di Tahap 1 (Landing Page):
1. **Koreografi Animasi Hero (`ShieldCenterpiece.tsx`)**:
   - Objek utama **Perisai Kaca 3D Transparan** meluncur dari kiri-atas menuju tengah-bawah layar dengan efek *motion blur* dan deselerasi halus, diikuti kemunculan bertahap (*staggered entrance*) navigasi atas, teks judul kiri, tombol *pill*, kartu *glassmorphism* kanan bawah, dan teks raksasa `DISIPLIN` di latar belakang.
   - Mendukung pemutaran video `.mp4` hasil generate AI Anda (`public/assets/shield-intro.mp4`).
2. **Dukungan Ikon Gembok 3D Transparan (`Padlock3DIcon.tsx`)**:
   - Cukup taruh gambar gembok Anda di `public/assets/padlock-3d.png` untuk menggantikan *fallback* gembok 3D bawaan secara otomatis.
3. **Fitur Interaktif Langsung di Landing Page (`QuickModals.tsx`)**:
   - **Cek Poin Siswa**: Simulasi pencarian NIS (`10293`, `10294`, `10295`) lengkap dengan rincian poin awal, pelanggaran, dan penghargaan.
   - **Buku Saku Digital**: Filter aturan tata tertib berdasarkan kategori (Ringan, Sedang, Berat, Penghargaan).
   - **Portal Login Multi-Role**: Pemilih akses untuk **Admin**, **Guru/BK**, dan **Siswa** yang siap dihubungkan ke tahap ke-2 (pembuatan halaman Dashboard).

## Cara Menjalankan Proyek:
1. Ekstrak file `.zip` ini.
2. Buka terminal di dalam folder proyek, lalu jalankan:
   ```bash
   npm install
   npm run dev
   ```
3. Buka `http://localhost:3000` di browser Anda.
