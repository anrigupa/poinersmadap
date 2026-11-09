import { z } from "zod";

export const ACHIEVEMENT_CATEGORIES = [
  "Akademik",
  "Ekstrakurikuler",
  "Tahfidz",
  "OSIS",
  "Paskibra",
  "Keagamaan",
  "Sosial",
] as const;

export const submitAchievementSchema = z.object({
  achievementName: z
    .string()
    .min(3, "Nama prestasi minimal 3 karakter")
    .max(255, "Nama prestasi maksimal 255 karakter"),
  category: z.enum(ACHIEVEMENT_CATEGORIES, {
    message: "Pilih kategori prestasi yang valid",
  }),
  description: z
    .string()
    .min(5, "Deskripsi prestasi minimal 5 karakter")
    .max(1000, "Deskripsi prestasi maksimal 1000 karakter"),
  evidenceUrl: z
    .string()
    .max(500, "Tautan bukti maksimal 500 karakter")
    .refine(
      (val) => !val || /^https?:\/\//i.test(val.trim()),
      "Tautan bukti harus berupa URL valid yang diawali http:// atau https://"
    )
    .optional()
    .or(z.literal("")),
});

export type SubmitAchievementFormData = z.infer<typeof submitAchievementSchema>;

export const convertMeritsSchema = z.object({
  studentId: z.string().optional(),
  pointsToConvert: z
    .number()
    .int("Jumlah poin harus berupa angka bulat")
    .min(1, "Minimal konversi 1 poin"),
  reason: z
    .string()
    .min(3, "Alasan pemutihan minimal 3 karakter")
    .max(500, "Alasan pemutihan maksimal 500 karakter"),
});

export type ConvertMeritsFormData = z.infer<typeof convertMeritsSchema>;
