"use client";

import Link from "next/link";
import {
  User,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  Mail,
  Phone,
  Calendar,
  ClipboardList,
  AlertTriangle,
  Users,
  Clock,
  BookOpen,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  FileText,
  LogOut,
  Building2,
  Sparkles,
  School,
  CheckCircle2,
} from "lucide-react";
import { UserProfile } from "@/types/auth";
import {
  TeacherDashboardStats,
  TeacherViolationRecord,
} from "@/features/teacher-dashboard/types";
import { signOutAction } from "@/features/auth/actions/authActions";

interface TeacherProfileClientProps {
  teacher: UserProfile;
  stats: TeacherDashboardStats;
  recentActivity?: TeacherViolationRecord[];
  academicYear?: string;
}

export default function TeacherProfileClient({
  teacher,
  stats,
  recentActivity = [],
  academicYear = "2026/2027 (Ganjil)",
}: TeacherProfileClientProps) {
  const isCounselor =
    teacher.teacherType === "counselor" ||
    teacher.specialization === "guru_bk" ||
    teacher.role === "admin";

  const hasAssignedClass = Boolean(
    teacher.assignedClass &&
      teacher.assignedClass.trim() !== "" &&
      teacher.assignedClass.toLowerCase() !== "null"
  );

  const isHomeroom =
    hasAssignedClass ||
    Boolean(teacher.className && teacher.className.toLowerCase().includes("wali")) ||
    teacher.specialization === "wali_kelas" ||
    teacher.role === "admin";

  // Teacher Type badge label and badge design
  const teacherTypeInfo = isCounselor
    ? {
        label: "Guru Bimbingan Konseling (BK)",
        badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800",
        icon: HeartHandshake,
      }
    : isHomeroom
    ? {
        label: `Wali Kelas ${teacher.assignedClass || teacher.className || ""}`,
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
        icon: GraduationCap,
      }
    : {
        label: "Guru Mata Pelajaran",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
        icon: BookOpen,
      };

  const TeacherTypeIcon = teacherTypeInfo.icon;

  const initials = teacher.fullName
    ? teacher.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "GU";

  // Specialization readable label
  const specializationDisplay = teacher.specialization
    ? teacher.specialization
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "Guru Mata Pelajaran";

  const rawPhone = teacher.phoneNumber || "081234567890";
  const formattedWaLink = `https://wa.me/${rawPhone.replace(/\D/g, "")}`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-8">
      {/* ============================================================== */}
      {/* PROFIL GURU HERO                                               */}
      {/* Banner (school info) + Avatar | Teacher Info | Status Role     */}
      {/* ============================================================== */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* --- Blue Banner with School Information --- */}
        <div className="relative h-36 sm:h-40 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 overflow-hidden">
          {/* Decorative shapes (purely visual) */}
          <div aria-hidden className="pointer-events-none absolute -top-16 -right-10 w-64 h-64 rounded-full bg-white/10" />
          <div aria-hidden className="pointer-events-none absolute -bottom-20 right-32 w-48 h-48 rounded-full bg-white/5" />

          <div className="relative h-full px-6 sm:px-8 pt-5 sm:pt-6 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm text-white flex items-center justify-center shrink-0">
                <School className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-black text-white tracking-tight leading-tight truncate">
                  SMA Negeri 2 Pangkep
                </p>
                <p className="text-[11px] sm:text-xs text-blue-100/90 font-medium truncate">
                  POINER SMADAP · Sistem Kedisiplinan Siswa
                </p>
              </div>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/15 text-white border border-white/20 backdrop-blur-sm shrink-0">
              <Calendar className="w-3.5 h-3.5" />
              TA {academicYear}
            </span>
          </div>
        </div>

        {/* --- Profile Row: Avatar | Teacher Information | Status Role --- */}
        <div className="px-6 sm:px-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_auto] items-center gap-x-6 gap-y-4">
            {/* Column 1: Avatar (overlaps banner) */}
            <div className="-mt-14 sm:-mt-16 flex justify-center md:justify-start">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white dark:bg-slate-900 p-1.5 shadow-lg ring-1 ring-slate-200/80 dark:ring-slate-700">
                <div className="w-full h-full rounded-[1.25rem] bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-3xl sm:text-4xl flex items-center justify-center tracking-tight select-none">
                  {initials}
                </div>
              </div>
            </div>

            {/* Column 2: Teacher Information */}
            <div className="min-w-0 text-center md:text-left md:pt-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Portal Guru &amp; BK
              </p>
              <h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight break-words">
                {teacher.fullName}
              </h1>
              <div className="mt-2 flex items-center justify-center md:justify-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 px-2 py-0.5 rounded-md">
                  NIP {teacher.nip || "198504122010012003"}
                </span>
              </div>
            </div>

            {/* Column 3: Status Role (below info on tablet, right side on desktop) */}
            <div className="md:col-start-2 lg:col-start-3 lg:pt-4 flex flex-wrap items-center justify-center md:justify-start lg:justify-end gap-2">
              <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                Pendidik Aktif
              </span>
              <span
                className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-bold border ${teacherTypeInfo.badgeClass}`}
              >
                <TeacherTypeIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[16rem]">{teacherTypeInfo.label}</span>
              </span>
            </div>
          </div>
        </div>

        {/* --- Footer strip --- */}
        <div className="px-6 sm:px-8 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <p className="text-center sm:text-left">
            Akun pendidik resmi untuk pencatatan kedisiplinan dan pembinaan siswa SMAN 2 Pangkep.
          </p>
          <span className="inline-flex items-center justify-center sm:justify-end gap-1.5 font-mono text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            ID {teacher.id?.substring(0, 8)}
          </span>
        </div>
      </section>

      {/* ============================================================== */}
      {/* INFORMASI KONTAK & PENUGASAN                                   */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* INFORMASI KONTAK */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Informasi Kontak Pendidik
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Terverifikasi</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Email Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 hover:bg-slate-50 transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Alamat Email Resmi
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate block mt-0.5">
                    {teacher.email}
                  </span>
                </div>
              </div>
              <a
                href={`mailto:${teacher.email}`}
                className="shrink-0 p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                title="Kirim Email"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* WhatsApp Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 hover:bg-slate-50 transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Nomor WhatsApp / Telepon
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs block mt-0.5">
                    {teacher.phoneNumber || "0812-3456-7890"}
                  </span>
                </div>
              </div>
              <a
                href={formattedWaLink}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-[11px] font-semibold flex items-center gap-1 transition"
                title="Hubungi via WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chat</span>
              </a>
            </div>
          </div>
        </div>

        {/* INFORMASI PENUGASAN */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Informasi Penugasan & Akademik
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">SMADAP</span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Assigned Class */}
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100/60 dark:border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                  Kelas Binaan:
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-right">
                  {hasAssignedClass
                    ? teacher.assignedClass
                    : "Tidak memiliki kelas binaan"}
                </span>
              </div>

              {/* Subject Specialization */}
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100/60 dark:border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  Spesialisasi Mapel:
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 text-right">
                  {specializationDisplay}
                </span>
              </div>

              {/* Academic Year */}
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  Tahun Ajaran Aktif:
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-right">
                  {academicYear}
                </span>
              </div>
            </div>
          </div>

          {/* Contextual Quick Actions */}
          <div className="pt-2 flex flex-wrap gap-2">
            {isHomeroom && (
              <Link
                href="/guru/classes"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-semibold transition"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Roster Kelas Binaan</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}

            {isCounselor && (
              <Link
                href="/guru/counseling"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-semibold transition"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Modul Bimbingan BK</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RINGKASAN AKTIVITAS DISIPLIN                                   */}
      {/* ============================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Ringkasan Aktivitas Disiplin
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Statistik Sepanjang Waktu</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Total Laporan Dibuat */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between group hover:border-blue-400 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-blue-900 dark:text-blue-200 bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 rounded-md border border-blue-300 dark:border-blue-800">
                Laporan
              </span>
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <ClipboardList className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
                {stats.totalPersonalSubmissions}
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2">
                Total Laporan Dibuat
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Laporan terverifikasi dalam database
              </p>
            </div>
          </div>

          {/* Card 2: Total Pelanggaran / Poin Dicatat */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between group hover:border-amber-400 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-amber-950 dark:text-amber-200 bg-amber-100 dark:bg-amber-950 px-2.5 py-0.5 rounded-md border border-amber-300 dark:border-amber-800">
                Poin Akumulasi
              </span>
              <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight font-mono">
                +{stats.totalPointsAccrued}
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2">
                Total Pelanggaran Dicatat
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Beban poin kedisiplinan diajukan
              </p>
            </div>
          </div>

          {/* Card 3: Jumlah Siswa Ditangani */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between group hover:border-indigo-400 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-indigo-950 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-950 px-2.5 py-0.5 rounded-md border border-indigo-300 dark:border-indigo-800">
                Siswa Unik
              </span>
              <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight font-mono">
                {stats.studentsHandledCount || 0}
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2">
                Jumlah Siswa Ditangani
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Siswa yang tercatat dalam riwayat pembinaan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIWAYAT AKTIVITAS TERBARU                                      */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Aktivitas Pelaporan Terakhir
              </h3>
              <p className="text-[11px] text-slate-400">
                Maksimal 5 laporan pelanggaran terbaru yang Anda ajukan
              </p>
            </div>
          </div>

          <Link
            href="/guru/history"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition group"
          >
            <span>Buka Seluruh Riwayat</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* List / Empty State */}
        {recentActivity.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Belum Ada Catatan Pelanggaran
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Laporan pelanggaran yang Anda catat akan otomatis terdata di sini dan tercatat permanen di sistem.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  <th className="py-3 px-3">Siswa</th>
                  <th className="py-3 px-3">Pelanggaran</th>
                  <th className="py-3 px-3">Waktu</th>
                  <th className="py-3 px-3 text-right">Poin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentActivity.slice(0, 5).map((record) => {
                  const studentInitials = record.studentName
                    ? record.studentName
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "SW";

                  const catBadge =
                    record.categoryName === "Berat"
                      ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                      : record.categoryName === "Sedang"
                      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800";

                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition group"
                    >
                      {/* Student */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
                            {studentInitials}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 dark:text-white truncate block">
                              {record.studentName}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {record.className} • NIS: {record.studentNis}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Violation */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {record.ruleCode}
                            </span>
                            <span
                              className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${catBadge}`}
                            >
                              {record.categoryName}
                            </span>
                          </div>
                          <span className="font-medium text-slate-700 dark:text-slate-300 block line-clamp-1 text-[11px]">
                            {record.violationName}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                        {record.formattedDate}
                      </td>

                      {/* Points */}
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs">
                          +{record.points}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* PENGATURAN KEAMANAN & SESI                                     */}
      {/* ============================================================== */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
            Manajemen Sesi & Keamanan
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Kredensial NIP dan hak akses guru dikelola oleh Administrator Sistem SMADAP POINER.
          </p>
        </div>

        <form action={signOutAction}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 dark:bg-slate-800 dark:hover:bg-rose-950/50 dark:text-slate-300 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-2xs transition active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar dari Akun</span>
          </button>
        </form>
      </div>
    </div>
  );
}
