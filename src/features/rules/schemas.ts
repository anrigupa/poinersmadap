import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Nama kategori minimal 2 karakter")
    .max(50, "Nama kategori maksimal 50 karakter"),
  severityLevel: z
    .number()
    .min(1, "Tingkat keparahan minimal 1")
    .max(3, "Tingkat keparahan maksimal 3"),
  description: z.string().max(255, "Deskripsi maksimal 255 karakter").optional(),
  colorCode: z
    .string()
    .min(4, "Kode warna wajib diisi")
    .max(20, "Kode warna tidak valid"),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export const violationSchema = z.object({
  categoryId: z.string().min(1, "Kategori pelanggaran wajib dipilih"),
  name: z
    .string()
    .min(3, "Nama pelanggaran minimal 3 karakter")
    .max(200, "Nama pelanggaran maksimal 200 karakter"),
  description: z
    .string()
    .min(5, "Deskripsi rincian aturan minimal 5 karakter")
    .max(1000, "Deskripsi maksimal 1000 karakter"),
  points: z
    .number()
    .min(1, "Bobot poin minimal 1")
    .max(100, "Bobot poin maksimal 100"),
  code: z.string().max(20, "Kode pasal maksimal 20 karakter").optional(),
  sanctionRecommendation: z.string().max(255).optional(),
});

export type ViolationFormData = z.infer<typeof violationSchema>;
