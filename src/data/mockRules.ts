export interface RuleItem {
  id: string;
  kode: string;
  kategori: "Ringan" | "Sedang" | "Berat" | "Penghargaan";
  deskripsi: string;
  poin: number;
}

export interface StudentRecord {
  nis: string;
  nama: string;
  kelas: string;
  poinAwal: number;
  totalPelanggaran: number;
  poinPenghargaan: number;
  status: "Sangat Baik" | "Aman" | "Pembinaan Wali Kelas" | "Panggilan BK";
  riwayat: {
    tanggal: string;
    kejadian: string;
    poin: number;
    pencatat: string;
  }[];
}

export const RULES_DATA: RuleItem[] = [
  { id: "1", kode: "K-01", kategori: "Ringan", deskripsi: "Terlambat hadir di sekolah lebih dari 10 menit", poin: -5 },
  { id: "2", kode: "K-02", kategori: "Ringan", deskripsi: "Atribut seragam sekolah tidak lengkap", poin: -5 },
  { id: "3", kode: "S-01", kategori: "Sedang", deskripsi: "Membolos pada jam pelajaran tanpa izin guru piket", poin: -15 },
  { id: "4", kode: "S-02", kategori: "Sedang", deskripsi: "Merusak fasilitas kelas atau sekolah secara sengaja", poin: -25 },
  { id: "5", kode: "B-01", kategori: "Berat", deskripsi: "Terlibat perundungan (bullying) fisik maupun siber", poin: -50 },
  { id: "6", kode: "P-01", kategori: "Penghargaan", deskripsi: "Menjadi pengurus aktif OSIS / MPK / Ekstrakurikuler", poin: 15 },
  { id: "7", kode: "P-02", kategori: "Penghargaan", deskripsi: "Juara lomba akademik/non-akademik tingkat Kabupaten/Provinsi", poin: 30 },
];

export const MOCK_STUDENTS: StudentRecord[] = [
  {
    nis: "10293",
    nama: "Aditya Pratama",
    kelas: "XI RPL 1",
    poinAwal: 100,
    totalPelanggaran: -5,
    poinPenghargaan: 15,
    status: "Sangat Baik",
    riwayat: [
      { tanggal: "12 Okt 2026", kejadian: "Juara 2 Lomba Web Design Kabupaten", poin: 15, pencatat: "Bpk. Hendra, S.Kom" },
      { tanggal: "02 Okt 2026", kejadian: "Terlambat hadir 12 menit", poin: -5, pencatat: "Ibu Rina (Guru Piket)" },
    ],
  },
  {
    nis: "10294",
    nama: "Nabila Syakieb",
    kelas: "XII TKJ 2",
    poinAwal: 100,
    totalPelanggaran: 0,
    poinPenghargaan: 30,
    status: "Sangat Baik",
    riwayat: [
      { tanggal: "20 Okt 2026", kejadian: "Juara 1 Olimpiade Jaringan Provinsi", poin: 30, pencatat: "Bpk. Hendra, S.Kom" },
    ],
  },
  {
    nis: "10295",
    nama: "Dimas Anggara",
    kelas: "X DKV 1",
    poinAwal: 100,
    totalPelanggaran: -20,
    poinPenghargaan: 0,
    status: "Pembinaan Wali Kelas",
    riwayat: [
      { tanggal: "18 Okt 2026", kejadian: "Tidak mengikuti apel pagi tanpa keterangan", poin: -15, pencatat: "Tim Tatib" },
      { tanggal: "05 Okt 2026", kejadian: "Atribut dasi dan topi tidak lengkap", poin: -5, pencatat: "Guru Piket" },
    ],
  },
];
