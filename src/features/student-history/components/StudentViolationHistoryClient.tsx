"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  X,
  FileSpreadsheet,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import {
  StudentHistoryPageData,
  StudentHistoryRecord,
  PaginatedResult,
} from "@/features/student-history/types";
import { getStudentViolationHistoryAction } from "@/features/student-history/actions";
import StudentHistoryStatsGrid from "@/features/student-history/components/StudentHistoryStatsGrid";
import StudentHistoryTable from "@/features/student-history/components/StudentHistoryTable";
import ViolationDetailModal from "@/features/student-history/components/ViolationDetailModal";
import StudentPaginationControls from "@/features/students/components/StudentPaginationControls";

interface StudentViolationHistoryClientProps {
  initialData: StudentHistoryPageData;
}

export default function StudentViolationHistoryClient({
  initialData,
}: StudentViolationHistoryClientProps) {
  const [data, setData] = useState<StudentHistoryPageData>(initialData);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateRange, setDateRange] = useState<"all" | "this_month">("all");
  const [sortBy, setSortBy] = useState<"incidentDate" | "points" | "categoryName">(
    "incidentDate"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Detail Modal State
  const [selectedRecord, setSelectedRecord] =
    useState<StudentHistoryRecord | null>(null);

  const [isPending, startTransition] = useTransition();

  // Query Data with Strict Personal Isolation
  const fetchRecords = useCallback(
    (overridePage?: number) => {
      startTransition(async () => {
        const targetPage = overridePage ?? page;
        const res = await getStudentViolationHistoryAction({
          search,
          category: selectedCategory,
          status: selectedStatus,
          dateRange,
          sortBy,
          sortOrder,
          page: targetPage,
          pageSize,
        });
        setData(res);
      });
    },
    [
      search,
      selectedCategory,
      selectedStatus,
      dateRange,
      sortBy,
      sortOrder,
      page,
      pageSize,
    ]
  );

  // Debounced filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecords(1);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [
    search,
    selectedCategory,
    selectedStatus,
    dateRange,
    sortBy,
    sortOrder,
    pageSize,
  ]);

  // Page navigation
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchRecords(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-600/10 text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Riwayat Pelanggaran Siswa
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Arsip lengkap catatan pelanggaran tata tertib pribadi Anda atas nama{" "}
            <strong className="text-slate-800">{data.studentName}</strong> (NIS: {data.studentNis} • {data.className}).
            Sesuai privasi, Anda hanya dapat mengakses rekam jejak pribadi Anda.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/rules"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span>Buku Saku Tata Tertib</span>
          </Link>

          <button
            onClick={() => fetchRecords()}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-xs"
            title="Refresh Data"
            aria-label="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <StudentHistoryStatsGrid stats={data.stats} />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pasal, nama pelanggaran, catatan, atau guru pelapor..."
              className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden transition"
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

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter berdasarkan Kategori"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-blue-500 focus:outline-hidden transition"
            >
              <option value="all">Semua Kategori</option>
              <option value="Ringan">Pelanggaran Ringan</option>
              <option value="Sedang">Pelanggaran Sedang</option>
              <option value="Berat">Pelanggaran Berat</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              aria-label="Filter berdasarkan Periode"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-blue-500 focus:outline-hidden transition"
            >
              <option value="all">Semua Waktu (Semester Ganjil)</option>
              <option value="this_month">Bulan Ini (November 2026)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter berdasarkan Status Laporan"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-blue-500 focus:outline-hidden transition"
            >
              <option value="all">Semua Status</option>
              <option value="confirmed">Dikonfirmasi</option>
              <option value="appealed">Dalam Proses Banding</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </div>

        {/* Sorting Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <span>Menampilkan data khusus siswa:</span>
            <strong className="text-slate-800">{data.studentName}</strong>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <ArrowUpDown className="w-3.5 h-3.5" /> Urutan:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Pilih kolom pengurutan"
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-hidden"
            >
              <option value="incidentDate">Waktu Kejadian</option>
              <option value="points">Bobot Poin</option>
              <option value="categoryName">Kategori Pelanggaran</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition"
            >
              {sortOrder === "desc" ? "Terbaru / Tinggi" : "Terlama / Rendah"}
            </button>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="relative">
        {isPending && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-2xs z-10 flex items-center justify-center rounded-3xl">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md border border-slate-100 text-xs text-slate-700">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Memuat data riwayat...</span>
            </div>
          </div>
        )}
        <StudentHistoryTable
          items={data.records.items}
          onSelectRecord={(rec) => setSelectedRecord(rec)}
        />
      </div>

      {/* Pagination Controls */}
      <StudentPaginationControls
        page={data.records.page}
        pageSize={data.records.pageSize}
        totalItems={data.records.totalItems}
        totalPages={data.records.totalPages}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Detail Modal */}
      <ViolationDetailModal
        isOpen={Boolean(selectedRecord)}
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
}
