"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Zap,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Lock,
  X,
  FileSpreadsheet,
  AlertTriangle,
} from "lucide-react";
import { UserProfile } from "@/types/auth";
import {
  TeacherViolationRecord,
  TeacherDashboardStats,
  PaginatedResult,
  ViolationDateRange,
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
import SectionHeader from "@/components/ui/SectionHeader";
import Badge from "@/components/ui/Badge";

interface TeacherDashboardClientProps {
  initialStats: TeacherDashboardStats;
  initialSubmissions: PaginatedResult<TeacherViolationRecord>;
  teacherProfile: UserProfile;
  availableStudents: StudentItem[];
  availableRules: ViolationItem[];
  hasPartialError?: boolean;
}

export default function TeacherDashboardClient({
  initialStats,
  initialSubmissions,
  teacherProfile,
  availableStudents,
  availableRules,
  hasPartialError = false,
}: TeacherDashboardClientProps) {
  const router = useRouter();
  const [stats, setStats] = useState<TeacherDashboardStats>(initialStats);
  const [submissions, setSubmissions] =
    useState<PaginatedResult<TeacherViolationRecord>>(initialSubmissions);
  const [showPartialWarning, setShowPartialWarning] = useState<boolean>(hasPartialError);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateRange, setDateRange] = useState<ViolationDateRange>("all");
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
        try {
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
          setShowPartialWarning(false);
        } catch (err) {
          console.warn("[TeacherDashboardClient] Error fetching submissions:", err);
          setShowPartialWarning(true);
        }
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

  const isCounselor =
    teacherProfile.teacherType === "counselor" ||
    teacherProfile.specialization === "guru_bk";

  const roleLabel = isCounselor
    ? "Guru BK"
    : teacherProfile.specialization === "guru_piket"
    ? "Guru Piket"
    : teacherProfile.specialization === "wali_kelas"
    ? "Wali Kelas"
    : "Guru Mata Pelajaran";

  const heroTitle = isCounselor
    ? "Dashboard Konseling & Pembinaan"
    : teacherProfile.specialization === "wali_kelas"
    ? "Dashboard Wali Kelas"
    : "Dashboard Guru";

  const heroSubtitle = isCounselor
    ? "Kelola pembinaan, konseling, prestasi, dan pemutihan poin siswa."
    : "Catat pelanggaran siswa dan pantau riwayat laporan Anda dalam satu dashboard.";

  const initials = teacherProfile.fullName
    .replace(/,.*$/, "")
    .split(" ")
    .filter((w) => w && !w.includes("."))
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-8">
      {/* Hero: Title -> Teacher Identity -> Primary Actions */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-5">
          {/* Row 1: Title */}
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white lg:whitespace-nowrap">
              {heroTitle}
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              {heroSubtitle}
            </p>
          </div>

          {/* Row 2: Teacher identity */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-4 border-t border-white/15">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 text-white font-black text-base flex items-center justify-center shrink-0">
              {initials || "G"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base sm:text-lg font-bold text-white leading-tight">
                {teacherProfile.fullName}
              </div>
              {teacherProfile.nip && (
                <div className="text-xs text-blue-100 font-mono font-semibold mt-0.5">
                  NIP: {teacherProfile.nip}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span className="whitespace-nowrap text-[11px] font-bold px-3 py-1 rounded-full bg-white text-blue-900 border border-white">
                {roleLabel}
              </span>
              <span className="inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                Pendidik Aktif
              </span>
            </div>
          </div>

          {/* Row 3: Primary actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <Link
              href="/guru/report"
              className="p-3.5 rounded-2xl bg-white hover:bg-blue-50 text-blue-950 transition shadow-lg shadow-blue-900/30 flex items-center gap-3 group"
            >
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 shrink-0 group-hover:scale-105 transition-transform">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0">
                <div className="font-bold text-sm text-blue-900">Catat Pelanggaran</div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  Gunakan alur lengkap untuk mencatat pelanggaran siswa.
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="p-3.5 rounded-2xl bg-blue-900/40 hover:bg-blue-900/60 text-white transition border border-white/30 flex items-center gap-3 group cursor-pointer text-left"
            >
              <div className="p-2.5 rounded-xl bg-white/20 text-white shrink-0 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 text-amber-300" />
              </div>
              <div className="text-left min-w-0">
                <div className="font-bold text-sm text-white">Input Cepat</div>
                <p className="text-[11px] text-blue-100 mt-0.5 leading-snug">
                  Catat pelanggaran tanpa meninggalkan dashboard.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Background decorative orb */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Metrics Cards: Violations Today, Violations This Month, Recent Submissions */}
      <TeacherMetricsCards stats={stats} />

      {/* Partial Load Warning Banner */}
      {showPartialWarning && (
        <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm font-semibold animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
            <span>Gagal memuat sebagian data. Silakan muat ulang halaman.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                fetchSubmissions();
                router.refresh();
              }}
              disabled={isPending}
              className="px-3.5 py-1.5 rounded-xl bg-amber-200/90 hover:bg-amber-300 active:scale-95 text-amber-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
              <span>Muat Ulang</span>
            </button>
            <button
              onClick={() => setShowPartialWarning(false)}
              className="p-1 rounded-lg text-amber-800 hover:text-amber-950 hover:bg-amber-100 transition"
              title="Tutup Pesan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Feedback Banner */}
      {banner && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 animate-in fade-in ${
            banner.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-medium"
              : "bg-red-50 border-red-300 text-red-950 font-medium"
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
      <SectionHeader
        title="Riwayat Pengajuan Pelanggaran Pribadi"
        description="Daftar laporan kedisiplinan yang Anda ajukan. Sesuai hak akses, Anda hanya dapat melihat catatan yang Anda input sendiri."
        badge={
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-300">
            <Lock className="w-3 h-3 text-slate-500" />
            Akses Pribadi
          </span>
        }
        action={
          <button
            onClick={() => fetchSubmissions()}
            className="self-start sm:self-auto p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition shadow-xs flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin text-blue-600" : ""}`} />
            <span>Refresh</span>
          </button>
        }
      />

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
              onChange={(e) => setDateRange(e.target.value as ViolationDateRange)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-blue-500 focus:outline-hidden transition"
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="this_week">Minggu Ini</option>
              <option value="this_month">Bulan Ini</option>
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
