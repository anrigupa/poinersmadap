export type UserRole = "admin" | "guru" | "siswa";

/**
 * Centralized role normalization function.
 * Normalizes Supabase database roles ('teacher', 'student') and application roles
 * ('guru', 'siswa', 'admin') into canonical UserRole.
 */
export function normalizeRole(rawRole: unknown): UserRole {
  if (!rawRole || typeof rawRole !== "string") {
    return "siswa";
  }

  const normalized = rawRole.toLowerCase().trim();
  switch (normalized) {
    case "admin":
      return "admin";
    case "guru":
    case "teacher":
    case "counselor":
      return "guru";
    case "siswa":
    case "student":
      return "siswa";
    default:
      console.warn(`[RoleNormalization] Unknown role encountered: '${rawRole}'. Defaulting to 'siswa'.`);
      return "siswa";
  }
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  teacherId?: string; // UUID from public.teachers(id)
  nis?: string; // For siswa
  nip?: string; // For guru
  className?: string; // For siswa / wali kelas
  specialization?: string; // e.g. "guru_piket" | "wali_kelas" | "guru_bk"
  teacherType?: "teacher" | "counselor";
  assignedClass?: string | null;
  phoneNumber?: string | null;
}

export interface AuthSession {
  user: UserProfile;
  token: string;
  expiresAt: number;
}

export interface SignInInput {
  identifier: string; // Email, NIP, or NIS
  password?: string;
  role?: UserRole;
}

export interface AuthActionResult {
  success: boolean;
  message?: string;
  redirectTo?: string;
  errors?: Record<string, string[]>;
}
