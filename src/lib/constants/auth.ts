import { UserRole, normalizeRole } from "@/types/auth";

export { normalizeRole };

export const AUTH_COOKIE_NAME = "poiner_auth_session";

const VALID_DATABASE_ROLES = new Set([
  "admin",
  "guru",
  "teacher",
  "counselor",
  "siswa",
  "student",
]);

/**
 * Validates that a raw role value comes from an explicit, approved database role.
 */
export function isValidDatabaseRole(rawRole: unknown): rawRole is string {
  if (!rawRole || typeof rawRole !== "string") return false;
  return VALID_DATABASE_ROLES.has(rawRole.toLowerCase().trim());
}

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
    badge: "bg-blue-100 text-blue-950 border-blue-300",
  },
  guru: {
    title: "Guru / BK / Wali Kelas",
    subtitle: "Input laporan pelanggaran, pantau kelas, dan konseling",
    badge: "bg-blue-100 text-blue-950 border-blue-300",
  },
  siswa: {
    title: "Siswa / Orang Tua",
    subtitle: "Pantau akumulasi poin, histori disiplin, dan buku saku",
    badge: "bg-emerald-100 text-emerald-900 border-emerald-300",
  },
};

