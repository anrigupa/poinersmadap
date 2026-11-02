import { z } from "zod";

export const addViolationSchema = z.object({
  studentId: z.string().min(1, "Siswa harus dipilih"),
  studentNis: z.string().min(1, "NIS siswa harus tersedia"),
  studentName: z.string().min(1, "Nama siswa harus tersedia"),
  className: z.string().min(1, "Kelas siswa harus tersedia"),
  violationTypeId: z.string().min(1, "Jenis pelanggaran harus dipilih"),
  ruleCode: z.string().min(1, "Kode aturan harus tersedia"),
  violationName: z.string().min(1, "Nama pelanggaran harus tersedia"),
  categoryName: z.string().min(1, "Kategori pelanggaran harus tersedia"),
  points: z.number().min(1, "Poin pelanggaran minimal 1"),
  notes: z
    .string()
    .min(3, "Catatan kronologi kejadian minimal 3 karakter")
    .max(500, "Catatan kronologi kejadian maksimal 500 karakter"),
  incidentDate: z.string().min(1, "Tanggal dan waktu insiden harus diisi"),
  evidenceUrl: z.string().optional(),
});

export type AddViolationFormData = z.infer<typeof addViolationSchema>;
