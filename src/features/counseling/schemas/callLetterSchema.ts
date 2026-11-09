import { z } from "zod";

export const CALL_PURPOSE_OPTIONS = [
  "Konseling Disiplin & Tata Tertib",
  "Peringatan Akumulasi Poin Pelanggaran (SP1/SP2/SP3)",
  "Konferensi Kasus (Case Conference)",
  "Klarifikasi Pelanggaran Tata Tertib Sekolah",
  "Evaluasi Kehadiran & Akademik Terkait Disiplin",
  "Tindak Lanjut Pemulihan Poin & Pembinaan Budi Pekerti",
] as const;

export const CALL_TYPE_OPTIONS = ["SP1", "SP2", "SP3", "Panggilan Rutin BK"] as const;

export const callLetterSchema = z.object({
  studentId: z.string().min(1, "Siswa wajib dipilih"),
  letterNumber: z.string().trim().min(3, "Nomor surat wajib diisi"),
  callType: z.enum(CALL_TYPE_OPTIONS),
  purpose: z.string().trim().min(3, "Keperluan pemanggilan wajib diisi"),
  scheduledDate: z.string().min(1, "Hari / Tanggal pertemuan wajib diisi"),
  scheduledTime: z.string().min(1, "Waktu pertemuan wajib diisi"),
  location: z.string().trim().min(3, "Tempat / Ruangan wajib diisi"),
  additionalNotes: z.string().trim().optional(),
});

export type CallLetterFormData = z.infer<typeof callLetterSchema>;
