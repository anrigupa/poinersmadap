import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  Settings,
  BookOpen,
  Award,
  ClipboardList,
  MessageSquare,
  User,
  type LucideIcon,
} from "lucide-react";
import { UserRole, UserProfile } from "@/types/auth";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
}

export interface NavSection {
  sectionTitle?: string;
  items: NavItem[];
}

export const ROLE_NAVIGATION: Record<UserRole, NavSection[]> = {
  admin: [
    {
      sectionTitle: "Menu Utama",
      items: [
        {
          title: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      sectionTitle: "Master Data",
      items: [
        {
          title: "Data Siswa & Kelas",
          href: "/admin/students",
          icon: GraduationCap,
        },
        {
          title: "Guru & Tenaga Pendidik",
          href: "/admin/teachers",
          icon: Users,
        },
        {
          title: "Katalog Tata Tertib",
          href: "/admin/rules",
          icon: BookOpen,
        },
      ],
    },
    {
      sectionTitle: "Oversight & Sanksi",
      items: [
        {
          title: "Surat Panggilan (SP)",
          href: "/admin/letters",
          icon: FileText,
          badge: "6 Aktif",
          badgeColor: "bg-rose-100 text-rose-700",
        },
        {
          title: "Pengaturan Sistem",
          href: "/admin/settings",
          icon: Settings,
        },
      ],
    },
  ],
  guru: [
    {
      sectionTitle: "Menu Utama",
      items: [
        {
          title: "Dashboard",
          href: "/guru",
          icon: LayoutDashboard,
        },
        {
          title: "Riwayat Laporan",
          href: "/guru/history",
          icon: ClipboardList,
        },
      ],
    },
    {
      sectionTitle: "Bimbingan & Pengawasan",
      items: [
        {
          title: "Kelas Binaan",
          href: "/guru/classes",
          icon: GraduationCap,
        },
        {
          title: "Konseling & Pembinaan",
          href: "/guru/counseling",
          icon: MessageSquare,
        },
      ],
    },
    {
      sectionTitle: "Akun & Referensi",
      items: [
        {
          title: "Profil",
          href: "/guru/profile",
          icon: User,
        },
        {
          title: "Buku Saku Tata Tertib",
          href: "/rules",
          icon: BookOpen,
        },
      ],
    },
  ],
  siswa: [
    {
      sectionTitle: "Menu Utama",
      items: [
        {
          title: "Kartu Disiplin",
          href: "/siswa",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      sectionTitle: "Pengembangan Diri",
      items: [
        {
          title: "Prestasi & Pemutihan Poin",
          href: "/siswa/merits",
          icon: Award,
          badge: "Merit",
          badgeColor: "bg-emerald-100 text-emerald-700",
        },
        {
          title: "Buku Saku Digital",
          href: "/rules",
          icon: BookOpen,
        },
      ],
    },
  ],
};

export const MOBILE_BOTTOM_NAV: Record<UserRole, NavItem[]> = {
  admin: [
    { title: "Beranda", href: "/admin", icon: LayoutDashboard },
    { title: "Siswa", href: "/admin/students", icon: GraduationCap },
    { title: "Guru", href: "/admin/teachers", icon: Users },
    { title: "Aturan", href: "/admin/rules", icon: BookOpen },
  ],
  guru: [
    { title: "Dashboard", href: "/guru", icon: LayoutDashboard },
    { title: "Riwayat", href: "/guru/history", icon: ClipboardList },
    { title: "Profil", href: "/guru/profile", icon: User },
  ],
  siswa: [
    { title: "Kartu Disiplin", href: "/siswa", icon: LayoutDashboard },
    { title: "Prestasi", href: "/siswa/merits", icon: Award },
    { title: "Buku Saku", href: "/rules", icon: BookOpen },
  ],
};

/**
 * Dynamic role-aware navigation generator for teachers.
 * Tailors sidebar sections according to whether teacher is regular,
 * homeroom (wali kelas), or counselor (guru BK).
 */
export function getTeacherNavigation(user?: UserProfile): NavSection[] {
  const isCounselor =
    user?.teacherType === "counselor" ||
    user?.specialization === "guru_bk" ||
    user?.role === "admin";

  const isHomeroom =
    Boolean(user?.assignedClass && user.assignedClass.trim() !== "" && user.assignedClass !== "null") ||
    Boolean(user?.className && user.className.toLowerCase().includes("wali")) ||
    user?.specialization === "wali_kelas" ||
    user?.role === "admin";

  const mainItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/guru",
      icon: LayoutDashboard,
    },
    {
      title: "Riwayat Laporan",
      href: "/guru/history",
      icon: ClipboardList,
    },
  ];

  const guidanceItems: NavItem[] = [];
  if (isHomeroom) {
    guidanceItems.push({
      title: "Kelas Binaan",
      href: "/guru/classes",
      icon: GraduationCap,
    });
  }
  if (isCounselor) {
    guidanceItems.push({
      title: "Konseling & Pembinaan",
      href: "/guru/counseling",
      icon: MessageSquare,
    });
  }

  const accountItems: NavItem[] = [
    {
      title: "Profil",
      href: "/guru/profile",
      icon: User,
    },
    {
      title: "Buku Saku Tata Tertib",
      href: "/rules",
      icon: BookOpen,
    },
  ];

  const sections: NavSection[] = [
    {
      sectionTitle: "Menu Utama",
      items: mainItems,
    },
  ];

  if (guidanceItems.length > 0) {
    sections.push({
      sectionTitle: "Bimbingan & Pengawasan",
      items: guidanceItems,
    });
  }

  sections.push({
    sectionTitle: "Akun & Referensi",
    items: accountItems,
  });

  return sections;
}

/**
 * Dynamic role-aware bottom navigation generator for mobile devices.
 * Synchronizes mobile navigation with desktop sidebar.
 */
export function getTeacherMobileNavigation(user?: UserProfile): NavItem[] {
  const isCounselor =
    user?.teacherType === "counselor" ||
    user?.specialization === "guru_bk" ||
    user?.role === "admin";

  const isHomeroom =
    Boolean(user?.assignedClass && user.assignedClass.trim() !== "" && user.assignedClass !== "null") ||
    Boolean(user?.className && user.className.toLowerCase().includes("wali")) ||
    user?.specialization === "wali_kelas" ||
    user?.role === "admin";

  const items: NavItem[] = [
    { title: "Dashboard", href: "/guru", icon: LayoutDashboard },
  ];

  if (isHomeroom) {
    items.push({ title: "Binaan", href: "/guru/classes", icon: GraduationCap });
  } else if (isCounselor) {
    items.push({ title: "Konseling", href: "/guru/counseling", icon: MessageSquare });
  }

  items.push({ title: "Riwayat", href: "/guru/history", icon: ClipboardList });
  items.push({ title: "Profil", href: "/guru/profile", icon: User });

  return items;
}

