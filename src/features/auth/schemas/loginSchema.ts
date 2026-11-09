import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(3, "Username, Email, NIP, atau NIS minimal 3 karakter")
    .max(100, "Maksimal 100 karakter"),
  password: z
    .string()
    .min(4, "Password minimal 4 karakter")
    .max(64, "Password maksimal 64 karakter"),
  role: z.enum(["admin", "guru", "siswa"]),
  rememberMe: z.boolean().default(false).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
