"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import {
  GraduationCap,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowUpDown,
  RefreshCw,
  X,
  Building,
} from "lucide-react";
import {
  StudentItem,
  PaginatedResult,
  StudentSummaryStats,
} from "@/features/students/types";
import { StudentFormData } from "@/features/students/schemas";
import {
  getStudentsAction,
  getStudentSummaryAction,
  addStudentAction,
  editStudentAction,
  deleteStudentAction,
  resetStudentPasswordAction,
} from "@/features/students/actions";
import StudentTable from "@/features/students/components/StudentTable";
import StudentModal from "@/features/students/components/StudentModal";
import ResetStudentPasswordModal from "@/features/students/components/ResetStudentPasswordModal";
import DeleteStudentDialog from "@/features/students/components/DeleteStudentDialog";
import StudentPaginationControls from "@/features/students/components/StudentPaginationControls";

interface StudentManagementClientProps {
  initialStudents: PaginatedResult<StudentItem>;
  initialSummary?: StudentSummaryStats;
}

const CLASS_OPTIONS = [
  "all",
  "X MIPA 1",
  "X MIPA 2",
  "X IPS 1",
  "X IPS 2",
  "X RPL 1",
  "XI MIPA 1",
  "XI MIPA 2",
  "XI IPS 1",
  "XI IPS 2",
  "XI RPL 1",
  "XI Bahasa 1",
  "XII MIPA 1",
  "XII MIPA 2",
  "XII MIPA 3",
  "XII IPS 1",
  "XII IPS 2",
];

const MAJOR_OPTIONS = ["all", "MIPA", "IPS", "Bahasa", "RPL", "TKJ"];

export default function StudentManagementClient({
  initialStudents,
  initialSummary = {
    totalStudents: initialStudents.totalItems,
    safeCount: initialStudents.items.filter((s) => s.totalViolationPoints < 30).length,
    warningCount: initialStudents.items.filter(
      (s) => s.totalViolationPoints >= 30 && s.totalViolationPoints < 75
    ).length,
    dangerCount: initialStudents.items.filter((s) => s.totalViolationPoints >= 75).length,
  },
}: StudentManagementClientProps) {
  const [studentsData, setStudentsData] = useState<PaginatedResult<StudentItem>>(initialStudents);
  const [summary, setSummary] = useState<StudentSummaryStats>(initialSummary);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedMajor, setSelectedMajor] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPointCat, setSelectedPointCat] = useState<
    "all" | "safe" | "warning" | "danger"
  >("all");
  const [sortBy, setSortBy] = useState<
    "fullName" | "nisn" | "className" | "totalViolationPoints"
  >("fullName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Dialogs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);

  const [isResetOpen, setIsResetOpen] = useState(false);
  const [studentToReset, setStudentToReset] = useState<StudentItem | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentItem | null>(null);

  // Notifications
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    message: string;
    authHint?: string;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  // Load data query function
  const fetchStudents = useCallback(
    (overridePage?: number) => {
      startTransition(async () => {
        const targetPage = overridePage ?? page;
        const res = await getStudentsAction({
          search,
          className: selectedClass,
          major: selectedMajor,
          status: selectedStatus,
          pointCategory: selectedPointCat,
          sortBy,
          sortOrder,
          page: targetPage,
          pageSize,
        });
        setStudentsData(res);

        // Also refresh summary metrics
        const updatedSummary = await getStudentSummaryAction();
        setSummary(updatedSummary);
      });
    },
    [
      search,
      selectedClass,
      selectedMajor,
      selectedStatus,
      selectedPointCat,
      sortBy,
      sortOrder,
      page,
      pageSize,
    ]
  );

  // Trigger query on filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents(1);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [
    search,
    selectedClass,
    selectedMajor,
    selectedStatus,
    selectedPointCat,
    sortBy,
    sortOrder,
    pageSize,
  ]);

  // Page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchStudents(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  // Handlers for Add/Edit
  const handleOpenAdd = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: StudentItem) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: StudentFormData) => {
    if (editingStudent) {
      const res = await editStudentAction(
        editingStudent.id,
        editingStudent.profileId,
        data
      );
      if (res.success) {
        setBanner({
          type: "success",
          message: res.message,
        });
        fetchStudents();
      }
      return res;
    } else {
      const res = await addStudentAction(data);
      if (res.success && res.data) {
        setBanner({
          type: "success",
          message: res.message,
          authHint: `Kredensial Login: ${res.data.student.email} / Password: ${res.data.initialPassword}`,
        });
        fetchStudents();
      }
      return res;
    }
  };

  // Reset Password Handler
  const handleOpenReset = (student: StudentItem) => {
    setStudentToReset(student);
    setIsResetOpen(true);
  };

  const handleResetConfirm = async (student: StudentItem, newPassword: string) => {
    const res = await resetStudentPasswordAction(student.profileId, newPassword);
    if (res.success) {
      setBanner({
        type: "success",
        message: res.message,
        authHint: `Password baru untuk ${student.fullName} (${student.email}): ${newPassword}`,
      });
      fetchStudents();
    }
    return res;
  };

  // Delete Handler
  const handleOpenDelete = (student: StudentItem) => {
    setStudentToDelete(student);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async (student: StudentItem) => {
    const res = await deleteStudentAction(student.id, student.profileId);
    if (res.success) {
      setBanner({
        type: "success",
        message: res.message,
      });
      fetchStudents();
    }
    return res;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-600/10 text-blue-600">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Manajemen Data Siswa
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Kelola data siswa, NISN, rombongan belajar kelas, jurusan, pemantauan poin
            pelanggaran dan poin prestasi, serta akun login Supabase Auth.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchStudents()}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-xs"
            title="Refresh Data"
            aria-label="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Siswa */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Siswa</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <GraduationCap className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{summary.totalStudents}</div>
          <p className="text-[11px] text-slate-400 mt-1">Terdaftar di sistem</p>
        </div>

        {/* Poin Aman */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Disiplin Baik (&lt;30)</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{summary.safeCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Status poin aman</p>
        </div>

        {/* Peringatan (30-74) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Peringatan (30-74)</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-600">{summary.warningCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Pembinaan Wali Kelas</p>
        </div>

        {/* Kritis (>=75) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Kritis / SP (≥75)</span>
            <span className="p-1.5 rounded-lg bg-red-50 text-red-600">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-red-600">{summary.dangerCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Penanganan Guru BK</p>
        </div>
      </div>

      {/* Alert Banner / Credentials Feedback */}
      {banner && (
        <div
          className={`p-4 rounded-2xl border flex items-start justify-between gap-3 animate-in fade-in ${
            banner.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-start gap-3">
            {banner.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <div className="font-semibold">{banner.message}</div>
              {banner.authHint && (
                <div className="p-2 bg-white/80 rounded-lg font-mono text-[11px] text-slate-800 border border-emerald-200/70 select-all">
                  {banner.authHint}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setBanner(null)}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, NISN, NIS, email, atau kelas..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Kelas */}
          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              aria-label="Filter berdasarkan Kelas"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-blue-500 focus:outline-hidden transition"
            >
              <option value="all">Semua Kelas</option>
              {CLASS_OPTIONS.filter((c) => c !== "all").map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Jurusan */}
          <div>
            <select
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              aria-label="Filter berdasarkan Jurusan"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-blue-500 focus:outline-hidden transition"
            >
              <option value="all">Semua Jurusan</option>
              {MAJOR_OPTIONS.filter((m) => m !== "all").map((m) => (
                <option key={m} value={m}>
                  Jurusan {m}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kategori Poin */}
          <div>
            <select
              value={selectedPointCat}
              onChange={(e) => setSelectedPointCat(e.target.value as any)}
              aria-label="Filter berdasarkan Kategori Poin"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-blue-500 focus:outline-hidden transition"
            >
              <option value="all">Semua Akumulasi Poin</option>
              <option value="safe">Poin Aman (&lt; 30)</option>
              <option value="warning">Peringatan (30 - 74)</option>
              <option value="danger">Kritis / SP (≥ 75)</option>
            </select>
          </div>
        </div>

        {/* Second Row: Status Sanksi & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Filter className="w-3.5 h-3.5" /> Status Sanksi:
            </span>
            <div className="flex items-center gap-1">
              {[
                { id: "all", label: "Semua" },
                { id: "active", label: "Aktif" },
                { id: "sp1", label: "SP 1" },
                { id: "sp2", label: "SP 2" },
                { id: "sp3", label: "SP 3" },
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

          {/* Sorting */}
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
              <option value="fullName">Nama Siswa</option>
              <option value="nisn">NISN</option>
              <option value="className">Kelas</option>
              <option value="totalViolationPoints">Poin Pelanggaran</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold"
            >
              {sortOrder === "asc" ? "A-Z / Naik" : "Z-A / Turun"}
            </button>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="relative">
        {isPending && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-2xs z-10 flex items-center justify-center rounded-2xl">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md border border-slate-100 text-xs text-slate-700">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Memuat data...</span>
            </div>
          </div>
        )}
        <StudentTable
          items={studentsData.items}
          onEdit={handleOpenEdit}
          onResetPassword={handleOpenReset}
          onDelete={handleOpenDelete}
        />
      </div>

      {/* Pagination Controls */}
      <StudentPaginationControls
        page={studentsData.page}
        pageSize={studentsData.pageSize}
        totalItems={studentsData.totalItems}
        totalPages={studentsData.totalPages}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Modals */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingStudent}
      />

      <ResetStudentPasswordModal
        isOpen={isResetOpen}
        student={studentToReset}
        onClose={() => setIsResetOpen(false)}
        onSubmit={handleResetConfirm}
      />

      <DeleteStudentDialog
        isOpen={isDeleteOpen}
        student={studentToDelete}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
