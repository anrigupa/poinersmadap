"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Lock,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { UserProfile } from "@/types/auth";
import {
  TeacherViolationRecord,
  TeacherDashboardStats,
  PaginatedResult,
} from "@/features/teacher-dashboard/types";
import { AddViolationFormData } from "@/features/teacher-dashboard/schemas";
import {
  getTeacherDashboardData,
  addTeacherViolationAction,
} from "@/features/teacher-dashboard/actions";
import { StudentItem } from "@/features/students/types";
import { ViolationItem } from "@/features/rules/types";
import TeacherMetricsCards from "@/features/teacher-dashboard/components/TeacherMetricsCards";
import RecentSubmissionsTable from "@/features/teacher-dashboard/components/RecentSubmissionsTable";
import AddViolationModal from "@/features/teacher-dashboard/components/AddViolationModal";
import StudentPaginationControls from "@/features/students/components/StudentPaginationControls";

interface TeacherDashboardClientProps {
  initialStats: TeacherDashboardStats;
  initialSubmissions: PaginatedResult<TeacherViolationRecord>;
  teacherProfile: UserProfile;
  availableStudents: StudentItem[];
  availableRules: ViolationItem[];
}

export default function TeacherDashboardClient({
  initialStats,
  initialSubmissions,
  teacherProfile,
  availableStudents,
  availableRules,
}: TeacherDashboardClientProps) {
  const [stats, setStats] = useState<TeacherDashboardStats>(initialStats);
  const [submissions, setSubmissions] =
    useState<PaginatedResult<TeacherViolationRecord>>(initialSubmissions);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateRange, setDateRange] = useState<"all" | "today" | "this_month">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Quick Action Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Feedback Notification
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  // Load teacher submissions (STRICT PERSONAL FILTER)
  const fetchSubmissions = useCallback(
    (overridePage?: number) => {
      startTransition(async () => {
        const targetPage = overridePage ?? page;
        const res = await getTeacherDashboardData(teacherProfile.id, {
          search,
          status: selectedStatus,
          dateRange,
          page: targetPage,
          pageSize,
        });
        setStats(res.stats);
        setSubmissions(res.recentSubmissions);
      });
    },
    [teacherProfile.id, search, selectedStatus, dateRange, page, pageSize]
  );

  // Search & filter debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubmissions(1);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedStatus, dateRange, pageSize]);

  // Page handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchSubmissions(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  // Add violation handler
  const handleAddViolationSubmit = async (data: AddViolationFormData) => {
    const res = await addTeacherViolationAction(teacherProfile, data);
    if (res.success) {
      setBanner({
        type: "success",
        message: res.message,
      });
      fetchSubmissions();
    }
    return res;
  };

  const roleLabel =
    teacherProfile.specialization === "guru_bk"
      ? "Guru Bimbingan Konseling (BK)"
      : teacherProfile.specialization === "guru_piket"
      ? "Guru Piket Kedisiplinan"
      : teacherProfile.specialization === "wali_kelas"
      ? `Wali Kelas ${teacherProfile.className || ""}`
      : "Guru Mata Pelajaran";

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full text-blue-100 border border-white/10">
                {roleLabel}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Akses Terverifikasi
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Selamat Datang, {teacherProfile.fullName}
            </h1>

            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Catat laporan insiden kedisiplinan siswa secara cepat, objektif, dan terverifikasi.
              Pantau riwayat laporan harian dan bulanan Anda dalam satu dashboard personal.
            </p>

            {teacherProfile.nip && (
              <div className="text-[11px] text-blue-200/90 font-mono pt-1">
                NIP: {teacherProfile.nip}
              </div>
            )}
          </div>

          {/* Quick Action Button & Full Workflow Link */}
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <Link
              href="/guru/report"
              className="px-5 py-3.5 rounded-2xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm transition shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 group text-center"
            >
              <PlusCircle className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
              <span>Input Pelanggaran (Alur Lengkap)</span>
            </Link>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition border border-white/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Quick Popup</span>
            </button>
          </div>
        </div>

        {/* Background decorative orb */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Metrics Cards: Violations Today, Violations This Month, Recent Submissions */}
      <TeacherMetricsCards stats={stats} />

      {/* Feedback Banner */}
      {banner && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 animate-in fade-in ${
            banner.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{banner.message}</span>
          </div>
          <button
            onClick={() => setBanner(null)}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Recent Submissions Section Header & Personal Isolation Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Riwayat Pengajuan Pelanggaran Pribadi
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              <Lock className="w-3 h-3 text-slate-400" />
              Akses Pribadi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar laporan kedisiplinan yang Anda ajukan. Sesuai hak akses, Anda hanya dapat melihat catatan yang Anda input sendiri.
          </p>
        </div>

        <button
          onClick={() => fetchSubmissions()}
          className="self-start sm:self-auto p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-xs flex items-center gap-1.5 text-xs font-medium"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar for Personal Submissions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari siswa, NIS, kelas, atau nama pelanggaran..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-blue-500 focus:outline-hidden transition"
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini Saja</option>
              <option value="this_month">Bulan Ini (November 2026)</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 text-[11px] flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          <div className="flex items-center gap-1">
            {[
              { id: "all", label: "Semua Laporan" },
              { id: "confirmed", label: "Dikonfirmasi" },
              { id: "appealed", label: "Banding" },
              { id: "cancelled", label: "Dibatalkan" },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setSelectedStatus(pill.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                  selectedStatus === pill.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submissions Table with Loading Overlay */}
      <div className="relative">
        {isPending && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-2xs z-10 flex items-center justify-center rounded-2xl">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md border border-slate-100 text-xs text-slate-700">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Memuat data...</span>
            </div>
          </div>
        )}
        <RecentSubmissionsTable items={submissions.items} />
      </div>

      {/* Pagination Controls */}
      <StudentPaginationControls
        page={submissions.page}
        pageSize={submissions.pageSize}
        totalItems={submissions.totalItems}
        totalPages={submissions.totalPages}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Quick Action Modal */}
      <AddViolationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddViolationSubmit}
        students={availableStudents}
        rules={availableRules}
      />
    </div>
  );
}
