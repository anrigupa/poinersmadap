import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ShieldAlert,
  FileText,
  History,
  Settings,
  BookOpen,
  Award,
  PlusCircle,
  ClipboardList,
  MessageSquare,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { UserRole } from "@/types/auth";

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
        {
          title: "Analitik Kedisiplinan",
          href: "/admin/analytics",
          icon: BarChart3,
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
          href: "/admin/sanctions",
          icon: FileText,
          badge: "6 Aktif",
          badgeColor: "bg-rose-100 text-rose-700",
        },
        {
          title: "Log Audit Sistem",
          href: "/admin/audit-logs",
          icon: History,
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
          title: "Beranda Guru",
          href: "/guru",
          icon: LayoutDashboard,
        },
        {
          title: "Input Pelanggaran",
          href: "/guru/report",
          icon: PlusCircle,
          badge: "Cepat",
          badgeColor: "bg-blue-100 text-blue-700",
        },
      ],
    },
    {
      sectionTitle: "Bimbingan & Pengawasan",
      items: [
        {
          title: "Kelas Binaan (Wali Kelas)",
          href: "/guru/classes",
          icon: GraduationCap,
        },
        {
          title: "Konseling & Pembinaan (BK)",
          href: "/guru/counseling",
          icon: MessageSquare,
        },
        {
          title: "Riwayat Laporan Anda",
          href: "/guru/history",
          icon: ClipboardList,
        },
      ],
    },
    {
      sectionTitle: "Referensi",
      items: [
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
        {
          title: "Riwayat Pelanggaran",
          href: "/siswa/history",
          icon: ShieldAlert,
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
    { title: "Sanksi", href: "/admin/sanctions", icon: FileText },
    { title: "Aturan", href: "/admin/rules", icon: BookOpen },
    { title: "Audit", href: "/admin/audit-logs", icon: History },
  ],
  guru: [
    { title: "Beranda", href: "/guru", icon: LayoutDashboard },
    { title: "Input", href: "/guru/report", icon: PlusCircle },
    { title: "Binaan", href: "/guru/classes", icon: GraduationCap },
    { title: "Konseling", href: "/guru/counseling", icon: MessageSquare },
    { title: "Aturan", href: "/rules", icon: BookOpen },
  ],
  siswa: [
    { title: "Kartu", href: "/siswa", icon: LayoutDashboard },
    { title: "Riwayat", href: "/siswa/history", icon: ShieldAlert },
    { title: "Prestasi", href: "/siswa/merits", icon: Award },
    { title: "Buku Saku", href: "/rules", icon: BookOpen },
  ],
};
