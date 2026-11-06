import { z } from "zod";

export const teacherFormSchema = z.object({
  nip: z
    .string()
    .min(5, "NIP minimal 5 karakter")
    .max(30, "NIP maksimal 30 karakter")
    .regex(/^[0-9\s-]+$/, "NIP hanya boleh berisi angka, tanda hubung, atau spasi"),
  fullName: z
    .string()
    .min(3, "Nama lengkap minimal 3 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
  email: z
    .string()
    .email("Format alamat email tidak valid")
    .max(100, "Email maksimal 100 karakter"),
  teacher_type: z.enum(["teacher", "counselor"]),
  specialization: z.enum([
    "guru_piket",
    "wali_kelas",
    "guru_bk",
    "guru_mapel",
  ]),
  phoneNumber: z
    .string()
    .min(9, "Nomor HP minimal 9 digit")
    .max(25, "Nomor HP maksimal 25 karakter")
    .regex(/^[0-9+\-\s()]+$/, "Nomor HP hanya boleh berisi angka, spasi, atau tanda + / -"),
  assignedClass: z.string().max(50).optional(),
  temporaryPassword: z
    .string()
    .min(6, "Password sementara minimal 6 karakter")
    .optional()
    .or(z.literal("")),
});

export type TeacherFormData = z.infer<typeof teacherFormSchema>;

export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, "Password baru minimal 6 karakter")
    .max(64, "Password baru maksimal 64 karakter"),
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
