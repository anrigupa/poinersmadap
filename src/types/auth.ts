export type UserRole = "admin" | "guru" | "siswa";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  nis?: string; // For siswa
  nip?: string; // For guru
  className?: string; // For siswa / wali kelas
  specialization?: string; // e.g. "guru_piket" | "wali_kelas" | "guru_bk"
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
