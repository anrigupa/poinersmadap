"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Search,
  UserPlus,
  Users,
  CheckCircle2,
  ArrowUpDown,
  Filter,
  ShieldCheck,
} from "lucide-react";
import TeacherTable from "@/features/teachers/components/TeacherTable";
import TeacherModal from "@/features/teachers/components/TeacherModal";
import ResetPasswordModal from "@/features/teachers/components/ResetPasswordModal";
import DeleteTeacherDialog from "@/features/teachers/components/DeleteTeacherDialog";
import PaginationControls from "@/features/rules/components/PaginationControls";
import {
  TeacherItem,
  TeacherType,
  PaginatedResult,
} from "@/features/teachers/types";
import { getTeachersAction } from "@/features/teachers/actions";

interface TeacherManagementClientProps {
  initialTeachers: PaginatedResult<TeacherItem>;
}

export default function TeacherManagementClient({
  initialTeachers,
}: TeacherManagementClientProps) {
  const [isPending, startTransition] = useTransition();

  const [teachersResult, setTeachersResult] = useState<PaginatedResult<TeacherItem>>(initialTeachers);
  const [searchTerm, setSearchTerm] = useState("");
  const [teacherTypeFilter, setTeacherTypeFilter] = useState<TeacherType | "all">("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"nip" | "fullName" | "email">("fullName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<TeacherItem | null>(null);

  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [teacherToReset, setTeacherToReset] = useState<TeacherItem | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<TeacherItem | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const reloadData = () => {
    startTransition(async () => {
      const res = await getTeachersAction({
        search: searchTerm,
        teacher_type: teacherTypeFilter === "all" ? undefined : teacherTypeFilter,
        specialization: specializationFilter === "all" ? undefined : specializationFilter,
        page: currentPage,
        pageSize,
        sortBy,
        sortOrder,
      });
      setTeachersResult(res);
    });
  };

  useEffect(() => {
    reloadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, teacherTypeFilter, specializationFilter, sortBy, sortOrder, currentPage, pageSize]);

  // Modal Triggers
  const handleOpenAddTeacher = () => {
    setTeacherToEdit(null);
    setIsTeacherModalOpen(true);
  };

  const handleOpenEditTeacher = (teacher: TeacherItem) => {
    setTeacherToEdit(teacher);
    setIsTeacherModalOpen(true);
  };

  const handleOpenResetPassword = (teacher: TeacherItem) => {
    setTeacherToReset(teacher);
    setIsResetPasswordOpen(true);
  };

  const handleOpenDelete = (teacher: TeacherItem) => {
    setTeacherToDelete(teacher);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 text-xs"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Manajemen Tenaga Pendidik
            </span>
            <span className="text-slate-400 text-xs">&bull;</span>
            <span className="text-xs text-slate-500 font-medium">Otorisasi Akun Guru</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Data Guru & Hak Akses Sistem
          </h1>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleOpenAddTeacher}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm shadow-blue-500/20 inline-flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Guru Baru (+Akun Auth)</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari berdasarkan NIP, nama guru, atau email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          />
        </div>

        {/* Dropdown Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Teacher Type Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={teacherTypeFilter}
              onChange={(e) => {
                setTeacherTypeFilter(e.target.value as TeacherType | "all");
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            >
              <option value="all">Semua Jenis Guru</option>
              <option value="teacher">Guru Mata Pelajaran (teacher)</option>
              <option value="counselor">Guru BK (counselor)</option>
            </select>
          </div>

          {/* Specialization Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <select
              value={specializationFilter}
              onChange={(e) => {
                setSpecializationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            >
              <option value="all">Semua Penugasan</option>
              <option value="guru_piket">Guru Piket</option>
              <option value="wali_kelas">Wali Kelas</option>
              <option value="guru_bk">Guru BK</option>
              <option value="guru_mapel">Guru Mapel</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split("-") as [any, any];
                setSortBy(f);
                setSortOrder(o);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            >
              <option value="fullName-asc">Nama: A - Z</option>
              <option value="fullName-desc">Nama: Z - A</option>
              <option value="nip-asc">NIP: Terkecil</option>
              <option value="nip-desc">NIP: Terbesar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <TeacherTable
        items={teachersResult.items}
        onEdit={handleOpenEditTeacher}
        onResetPassword={handleOpenResetPassword}
        onDelete={handleOpenDelete}
      />

      {/* Pagination Controls */}
      <PaginationControls
        page={teachersResult.page}
        pageSize={teachersResult.pageSize}
        totalItems={teachersResult.totalItems}
        totalPages={teachersResult.totalPages}
        onPageChange={(p) => setCurrentPage(p)}
        onPageSizeChange={(sz) => {
          setPageSize(sz);
          setCurrentPage(1);
        }}
      />

      {/* Modals */}
      <TeacherModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        teacherToEdit={teacherToEdit}
        onSuccess={(msg) => {
          showToast(msg);
          reloadData();
        }}
      />

      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
        teacher={teacherToReset}
        onSuccess={(msg) => {
          showToast(msg);
          reloadData();
        }}
      />

      <DeleteTeacherDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        teacher={teacherToDelete}
        onSuccess={(msg) => {
          showToast(msg);
          reloadData();
        }}
      />
    </div>
  );
}
