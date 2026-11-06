import { z } from "zod";

export const counselingFormSchema = z.object({
  studentId: z.string().min(1, "Siswa harus dipilih"),
  counselingType: z.string().min(1, "Jenis konseling wajib dipilih"),
  description: z.string().min(5, "Deskripsi/catatan bimbingan minimal 5 karakter"),
  counselingDate: z.string().min(1, "Tanggal konseling wajib diisi"),
  pointReduction: z.coerce.number().min(0, "Pengurangan poin tidak boleh bernilai negatif").default(0),
  reductionReason: z.string().optional(),
  evidenceNotes: z.string().optional(),
});

export type CounselingFormData = z.infer<typeof counselingFormSchema>;
