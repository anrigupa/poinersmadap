import { z } from "zod";
import { ALL_AVAILABLE_CLASSES } from "@/lib/constants/classes";

export const studentFormSchema = z.object({
  nisn: z
    .string()
    .min(8, "NISN minimal 8 digit")
    .max(12, "NISN maksimal 12 digit")
    .regex(/^[0-9]+$/, "NISN hanya boleh berisi angka"),
  nis: z
    .string()
    .min(4, "NIS minimal 4 digit")
    .max(10, "NIS maksimal 10 digit")
    .regex(/^[0-9]+$/, "NIS hanya boleh berisi angka"),
  fullName: z
    .string()
    .min(3, "Nama lengkap siswa minimal 3 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
  email: z
    .string()
    .email("Format alamat email siswa tidak valid")
    .max(100, "Email maksimal 100 karakter"),
  className: z.enum(ALL_AVAILABLE_CLASSES, {
    message: "Pilih kelas yang valid dari daftar (contoh: X.A, XI.F, XII.I)",
  }),
  gender: z.enum(["L", "P"]),
  parentName: z.string().max(100).optional(),
  parentPhone: z
    .string()
    .max(20)
    .regex(/^[0-9+\s-]*$/, "Nomor telepon tidak valid")
    .optional(),
  temporaryPassword: z
    .string()
    .min(6, "Password sementara minimal 6 karakter")
    .optional(),
});

export type StudentFormData = z.infer<typeof studentFormSchema>;

export const resetStudentPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, "Password baru minimal 6 karakter")
    .max(64, "Password baru maksimal 64 karakter"),
});

export type ResetStudentPasswordFormData = z.infer<typeof resetStudentPasswordSchema>;
