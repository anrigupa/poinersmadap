import { z } from "zod";

export const ACADEMIC_YEAR_OPTIONS = [
  "2026/2027",
  "2027/2028",
  "2028/2029",
  "2029/2030",
] as const;

export const ALL_ACADEMIC_YEARS = [
  "2024/2025",
  "2025/2026",
  "2026/2027",
  "2027/2028",
  "2028/2029",
  "2029/2030",
] as const;

export const SEMESTER_OPTIONS = ["Ganjil", "Genap"] as const;

export const academicSettingsSchema = z.object({
  academicYear: z
    .string()
    .trim()
    .regex(
      /^\d{4}\/\d{4}$/,
      "Format Tahun Ajaran harus YYYY/YYYY (contoh: 2026/2027)."
    ),
  semester: z.enum(SEMESTER_OPTIONS, {
    message: "Pilih semester yang valid (Ganjil atau Genap).",
  }),
});

export const createAcademicPeriodSchema = z.object({
  academicYear: z
    .string()
    .trim()
    .regex(
      /^\d{4}\/\d{4}$/,
      "Format Tahun Ajaran harus YYYY/YYYY (contoh: 2026/2027)."
    ),
  semester: z.enum(SEMESTER_OPTIONS, {
    message: "Pilih semester yang valid (Ganjil atau Genap).",
  }),
  setAsActive: z.boolean().default(false),
});

export type AcademicSettingsFormData = z.infer<typeof academicSettingsSchema>;
export type CreateAcademicPeriodFormData = z.infer<
  typeof createAcademicPeriodSchema
>;
