"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  Image as ImageIcon,
  ExternalLink,
  Lock,
  X,
  Eye,
  Calendar,
  User,
  GraduationCap,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { UserProfile } from "@/types/auth";
import {
  TeacherViolationRecord,
  PaginatedResult,
  ViolationDateRange,
} from "@/features/teacher-dashboard/types";
import { PERIOD_LABELS } from "@/lib/dateUtils";
import { getTeacherDashboardData } from "@/features/teacher-dashboard/actions";
import StudentPaginationControls from "@/features/students/components/StudentPaginationControls";

interface TeacherHistoryClientProps {
  initialSubmissions: PaginatedResult<TeacherViolationRecord>;
  teacherProfile: UserProfile;
}

export default function TeacherHistoryClient({
  initialSubmissions,
  teacherProfile,
}: TeacherHistoryClientProps) {
  const [submissions, setSubmissions] =
    useState<PaginatedResult<TeacherViolationRecord>>(initialSubmissions);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateRange, setDateRange] = useState<ViolationDateRange>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // View Details Modal
  const [selectedRecord, setSelectedRecord] = useState<TeacherViolationRecord | null>(null);

  const [isPending, startTransition] = useTransition();

  // Load teacher submissions strictly for authenticated teacher
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
        setSubmissions(res.recentSubmissions);
      });
    },
    [teacherProfile.id, search, selectedStatus, dateRange, page, pageSize]
  );

  // Debounce search and filter updates
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubmissions(1);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedStatus, dateRange, pageSize]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchSubmissions(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Riwayat Laporan Anda
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <Lock className="w-3.5 h-3.5" />
              Akses Personal: {teacherProfile.fullName}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Daftar seluruh laporan pelanggaran disiplin siswa yang Anda catat dan laporkan secara mandiri.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchSubmissions()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition active:scale-95"
            title="Muat ulang data laporan"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama siswa, NIS, kelas, atau nama pelanggaran..."
              className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Date Filter Dropdown */}
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as ViolationDateRange)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="this_week">Minggu Ini</option>
              <option value="this_month">Bulan Ini</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 text-xs flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            {[
              { id: "all", label: "Semua Laporan" },
              { id: "confirmed", label: "Dikonfirmasi" },
              { id: "appealed", label: "Banding" },
              { id: "cancelled", label: "Dibatalkan" },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setSelectedStatus(pill.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedStatus === pill.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Periode: <strong className="text-slate-800 dark:text-slate-200">{PERIOD_LABELS[dateRange]}</strong> ({submissions.totalItems} laporan)
          </div>
        </div>
      </div>

      {/* 3. Submissions Table & List View */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden relative">
        {isPending && (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Memuat riwayat laporan...</span>
            </div>
          </div>
        )}

        {submissions.items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <FileText className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {dateRange !== "all" && !search && selectedStatus === "all"
                ? "Tidak ada laporan pada periode ini."
                : search || selectedStatus !== "all" || dateRange !== "all"
                ? "Tidak ada laporan yang sesuai kriteria"
                : "Belum ada riwayat laporan pribadi"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {dateRange !== "all" && !search && selectedStatus === "all"
                ? `Tidak ditemukan catatan pelanggaran siswa yang dilaporkan untuk periode ${PERIOD_LABELS[dateRange].toLowerCase()}.`
                : search || selectedStatus !== "all" || dateRange !== "all"
                ? "Coba ubah kata kunci pencarian atau sesuaikan filter status dan tanggal."
                : "Anda belum pernah mencatat laporan pelanggaran siswa. Laporan yang Anda buat akan muncul di sini."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4">Waktu Insiden</th>
                    <th className="py-3.5 px-4">Nama Siswa</th>
                    <th className="py-3.5 px-4">Kelas</th>
                    <th className="py-3.5 px-4">Pelanggaran</th>
                    <th className="py-3.5 px-4 text-center">Poin</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                  {submissions.items.map((record, index) => {
                    const rowNumber = (submissions.page - 1) * submissions.pageSize + index + 1;
                    const catBadge =
                      record.categoryName === "Berat"
                        ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                        : record.categoryName === "Sedang"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";

                    return (
                      <tr
                        key={record.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition group"
                      >
                        {/* No */}
                        <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-400">
                          {rowNumber}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{record.formattedDate}</span>
                          </div>
                        </td>

                        {/* Student Name */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                            {record.studentName}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            NIS: {record.studentNis}
                          </div>
                        </td>

                        {/* Class */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {record.className}
                          </span>
                        </td>

                        {/* Violation */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {record.ruleCode}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catBadge}`}
                            >
                              {record.categoryName}
                            </span>
                          </div>
                          <div className="text-slate-800 dark:text-slate-200 font-medium text-xs truncate" title={record.violationName}>
                            {record.violationName}
                          </div>
                        </td>

                        {/* Points */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                            <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                            +{record.points} Poin
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {record.status === "confirmed" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              Dikonfirmasi
                            </span>
                          ) : record.status === "appealed" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              <ShieldAlert className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              Banding
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              Dibatalkan
                            </span>
                          )}
                        </td>

                        {/* Action: View Details */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-900/50 transition active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {submissions.items.map((record, index) => {
                const rowNumber = (submissions.page - 1) * submissions.pageSize + index + 1;
                return (
                  <div key={record.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">#{rowNumber}</span>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {record.studentName}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          NIS: {record.studentNis} • {record.className}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                        +{record.points} Poin
                      </span>
                    </div>

                    <div className="text-xs bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {record.ruleCode}
                        </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {record.violationName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{record.formattedDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        {record.status === "confirmed" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            Dikonfirmasi
                          </span>
                        ) : record.status === "appealed" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            <ShieldAlert className="w-3 h-3" />
                            Banding
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            Dibatalkan
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 hover:bg-blue-100 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Detail</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 4. Pagination Controls */}
      {submissions.totalPages > 1 && (
        <StudentPaginationControls
          page={submissions.page}
          pageSize={submissions.pageSize}
          totalItems={submissions.totalItems}
          totalPages={submissions.totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* 5. View Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {selectedRecord.ruleCode}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Detail Laporan Pelanggaran
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {/* Student Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Siswa Terlapor
                  </p>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    {selectedRecord.studentName}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">
                    NIS: {selectedRecord.studentNis} • Kelas: {selectedRecord.className}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                    +{selectedRecord.points} Poin
                  </span>
                </div>
              </div>

              {/* Violation Info */}
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Kategori & Nama Pelanggaran
                </p>
                <div className="font-semibold text-slate-900 dark:text-white text-sm">
                  {selectedRecord.violationName}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Kategori: {selectedRecord.categoryName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    Status: {selectedRecord.status === "confirmed" ? "Dikonfirmasi" : selectedRecord.status === "appealed" ? "Banding" : "Dibatalkan"}
                  </span>
                </div>
              </div>

              {/* Time of Incident */}
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Waktu Pelaporan / Insiden
                </p>
                <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{selectedRecord.formattedDate}</span>
                </div>
              </div>

              {/* Notes / Chronology */}
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Kronologis / Catatan Guru
                </p>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                  {selectedRecord.notes || "Tidak ada catatan khusus yang dilampirkan."}
                </div>
              </div>

              {/* Photo Evidence (if any) */}
              {selectedRecord.evidenceUrl && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Bukti Foto
                  </p>
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-950">
                    <img
                      src={selectedRecord.evidenceUrl}
                      alt="Bukti Pelanggaran"
                      className="w-full max-h-48 object-cover group-hover:opacity-90 transition"
                    />
                    <a
                      href={selectedRecord.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 right-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Gambar Penuh</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Reporter Info */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Pelapor: <strong>{selectedRecord.reportedByName}</strong></span>
                <span className="font-mono">ID: {selectedRecord.id}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
