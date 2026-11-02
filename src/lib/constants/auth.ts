import { UserProfile, UserRole } from "@/types/auth";

export const AUTH_COOKIE_NAME = "poiner_auth_session";

export const ROLE_REDIRECT_MAP: Record<UserRole, string> = {
  admin: "/admin",
  guru: "/guru",
  siswa: "/siswa",
};

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
      email: "guru.bk@smadap.sch.id",
      fullName: "Siti Rahmawati, S.Pd (Guru BK)",
      role: "guru",
      nip: "198504122010012003",
      specialization: "guru_bk",
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
