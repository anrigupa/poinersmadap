import { z } from "zod";

export const recordViolationSchema = z.object({
  studentId: z.string().min(1, "Siswa harus dipilih"),
  violationTypeId: z.string().min(1, "Jenis pelanggaran harus dipilih"),
  points: z.number().min(1, "Bobot poin minimal 1"),
  incidentDate: z.string().min(1, "Tanggal dan waktu insiden harus ditentukan"),
  location: z.string().max(100, "Lokasi kejadian maksimal 100 karakter").optional(),
  notes: z
    .string()
    .min(3, "Catatan kronologis minimal 3 karakter")
    .max(1000, "Catatan kronologis maksimal 1000 karakter"),
  evidenceUrl: z.string().optional(),
  sanctionAction: z.string().max(100).optional(),
});

export type RecordViolationFormData = z.infer<typeof recordViolationSchema>;
