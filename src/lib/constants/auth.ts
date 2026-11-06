import { UserProfile, UserRole, normalizeRole } from "@/types/auth";

export { normalizeRole };

export const AUTH_COOKIE_NAME = "poiner_auth_session";

/**
 * Role to Route Redirection Map supporting both canonical ('guru', 'siswa', 'admin')
 * and database alias ('teacher', 'student') identifiers.
 */
export const ROLE_REDIRECT_MAP: Record<string, string> = {
  admin: "/admin",
  guru: "/guru",
  teacher: "/guru",
  siswa: "/siswa",
  student: "/siswa",
};

/**
 * Defensive redirect resolver: ensures a safe destination is ALWAYS returned.
 * Prevents any generation of `/undefined` routes when unexpected roles or states occur.
 */
export function getRoleRedirectPath(rawRole: unknown): string {
  const normalized = normalizeRole(rawRole);
  const target =
    ROLE_REDIRECT_MAP[normalized] ||
    ROLE_REDIRECT_MAP[String(rawRole).toLowerCase().trim()];

  if (!target) {
    console.warn(`[getRoleRedirectPath] Unmapped role '${rawRole}'. Defaulting safely to '/login'.`);
    return "/login";
  }

  return target;
}

export const ROLE_LABELS: Record<UserRole, { title: string; subtitle: string; badge: string }> = {
  admin: {
    title: "Administrator / Tatib",
    subtitle: "Kelola master aturan, pengguna, dan otorisasi sistem",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
  },
  guru: {
    title: "Guru / BK / Wali Kelas",
    subtitle: "Input laporan pelanggaran, pantau kelas, dan konseling",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
  },
  siswa: {
    title: "Siswa / Orang Tua",
    subtitle: "Pantau akumulasi poin, histori disiplin, dan buku saku",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
};

/**
 * Pre-configured demo accounts for immediate development & evaluation testing
 * when live Supabase Auth environment variables are not populated.
 */
export const DEMO_ACCOUNTS: Record<UserRole, { profile: UserProfile; passwordHint: string }> = {
  admin: {
    profile: {
      id: "usr-admin-01",
      email: "admin@smadap.sch.id",
      fullName: "Drs. H. Bambang Prakoso, M.Pd",
      role: "admin",
      specialization: "Kepala Tim Ketertiban",
    },
    passwordHint: "admin123",
  },
  guru: {
    profile: {
      id: "usr-guru-01",
      teacherId: "c8b716f0-4504-46bf-aef8-b2cb00691c5d",
      email: "guru.bk@smadap.sch.id",
      fullName: "Siti Rahmawati, S.Pd (Guru BK)",
      role: "guru",
      nip: "198504122010012003",
      teacherType: "counselor",
      specialization: "guru_bk",
      assignedClass: "Wali Kelas XI MIPA 2",
      className: "Wali Kelas XI MIPA 2",
    },
    passwordHint: "guru123",
  },
  siswa: {
    profile: {
      id: "usr-siswa-01",
      email: "siswa.10293@smadap.sch.id",
      fullName: "Muhammad Rizky Pratama",
      role: "siswa",
      nis: "10293",
      className: "XI MIPA 2",
    },
    passwordHint: "siswa123",
  },
};
