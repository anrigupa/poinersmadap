"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Search,
  FileSpreadsheet,
  ShieldAlert,
  ArrowLeft,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import * as XLSX from "xlsx";
import { HomeroomClassData, HomeroomStudentItem } from "@/features/teacher-dashboard/types";
import { getDisciplinaryLevel } from "@/lib/constants/discipline";

interface HomeroomClassClientProps {
  initialData: HomeroomClassData;
}

export default function HomeroomClassClient({ initialData }: HomeroomClassClientProps) {
  const { isHomeroom, assignedClass, message, summary, students } = initialData;
  const [searchTerm, setSearchTerm] = useState("");

  // Filter students based on search term (name, NISN, NIS)
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const term = searchTerm.toLowerCase();
    return students.filter(
      (s) =>
        s.studentName.toLowerCase().includes(term) ||
        s.nisn.toLowerCase().includes(term) ||
        (s.nis && s.nis.toLowerCase().includes(term))
    );
  }, [students, searchTerm]);

  // Export class roster to Excel (.xlsx)
  const handleExportExcel = () => {
    if (filteredStudents.length === 0) return;

    const exportRows = filteredStudents.map((s, index) => ({
      No: index + 1,
      "Nama Siswa": s.studentName,
      NISN: s.nisn,
      Kelas: s.className,
      "Jumlah Pelanggaran": s.totalViolations,
      "Total Poin": s.totalPoints,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    const sheetName = `Kelas ${assignedClass || "Binaan"}`.substring(0, 31);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Auto-fit column widths
    worksheet["!cols"] = [
      { wch: 6 },  // No
      { wch: 32 }, // Nama Siswa
      { wch: 18 }, // NISN
      { wch: 15 }, // Kelas
      { wch: 20 }, // Jumlah Pelanggaran
      { wch: 15 }, // Total Poin
    ];

    const cleanClassName = (assignedClass || "Binaan").replace(/[^a-zA-Z0-9_-]/g, "_");
    const dateStr = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `Roster_Kelas_${cleanClassName}_${dateStr}.xlsx`);
  };

  // -------------------------------------------------------------
  // ACCESS CONTROL: Not a Homeroom Teacher
  // -------------------------------------------------------------
  if (!isHomeroom) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Akses Dibatasi
          </h2>
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-3 bg-rose-50 dark:bg-rose-950/40 py-2 px-3 rounded-xl border border-rose-100 dark:border-rose-900/40">
            {message || "Akses hanya dimiliki oleh wali kelas."}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            Menu Kelas Binaan dirancang khusus untuk guru yang mendapatkan mandat penugasan sebagai Wali Kelas. Apabila Anda adalah wali kelas yang belum terdaftar, silakan menghubungi Administrator atau Kurikulum.
          </p>
          <Link
            href="/guru"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-slate-900/10 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda Guru
          </Link>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // HOMEROOM TEACHER VIEW
  // -------------------------------------------------------------
  return (
    <div className="space-y-8">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Kelas Binaan
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <GraduationCap className="w-3.5 h-3.5" />
              Wali Kelas: {assignedClass}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Rekap kepatuhan disiplin dan daftar absensi poin siswa binaan kelas Anda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            disabled={filteredStudents.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition shadow-sm shadow-emerald-600/20 active:scale-95 cursor-pointer"
            title="Export Roster ke File Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export ke Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* 2. Discipline Summary KPI Cards (Value -> Label -> Description) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Siswa */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-blue-900 dark:text-blue-200 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-md border border-blue-300 dark:border-blue-800">
              Kelas {assignedClass}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              {summary.totalStudents}
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2">
              Total Siswa Binaan
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Siswa terdaftar di rombel {assignedClass}
            </p>
          </div>
        </div>

        {/* Siswa Bebas Pelanggaran */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
              Predikat Bersih
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              {summary.studentsWithoutViolations}
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2">
              Bebas Pelanggaran
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Siswa dengan 0 catatan poin pelanggaran
            </p>
          </div>
        </div>

        {/* Siswa Dengan Pelanggaran */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-amber-950 dark:text-amber-200 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800">
              Perlu Pembinaan
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono tracking-tight">
              {summary.studentsWithViolations}
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2">
              Dengan Pelanggaran
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Siswa memiliki catatan beban kedisiplinan
            </p>
          </div>
        </div>

        {/* Rata-rata Poin Pelanggaran */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-indigo-950 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded-md border border-indigo-300 dark:border-indigo-800">
              Indikator Kelas
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">
              {summary.averageViolationPoints}
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2">
              Rata-rata Poin
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Rata-rata akumulasi poin per siswa di kelas
            </p>
          </div>
        </div>
      </div>

      {/* 3. Search Bar & Roster Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Search Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama siswa atau NISN..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 transition"
            />
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium self-end sm:self-center">
            Menampilkan <span className="font-bold text-slate-700 dark:text-slate-200">{filteredStudents.length}</span> dari {students.length} siswa
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4">NISN</th>
                <th className="py-3.5 px-4">Kelas</th>
                <th className="py-3.5 px-4 text-center">Jumlah Kejadian</th>
                <th className="py-3.5 px-4 text-center">Total Poin</th>
                <th className="py-3.5 px-4 text-center">Status Disiplin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    {searchTerm ? "Tidak ada siswa yang sesuai dengan pencarian." : "Belum ada data siswa di kelas ini."}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, index) => {
                  const disc = getDisciplinaryLevel(s.totalPoints);
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition group"
                    >
                      <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                          {s.studentName}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-600 dark:text-slate-400">
                        {s.nisn}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {s.className}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {s.totalViolations}
                        </span>{" "}
                        <span className="text-xs text-slate-400">kali</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            s.totalPoints === 0
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : s.totalPoints < 30
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                          }`}
                        >
                          {s.totalPoints} Poin
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${disc.badgeClass}`}
                        >
                          {disc.level}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {filteredStudents.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              {searchTerm ? "Tidak ada siswa yang sesuai dengan pencarian." : "Belum ada data siswa di kelas ini."}
            </div>
          ) : (
            filteredStudents.map((s, index) => {
              const disc = getDisciplinaryLevel(s.totalPoints);
              return (
                <div key={s.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {s.studentName}
                        </h4>
                      </div>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">NISN: {s.nisn}</p>
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${disc.badgeClass}`}
                    >
                      {disc.level}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                    <span className="text-slate-500">
                      Pelanggaran: <strong className="text-slate-800 dark:text-slate-200">{s.totalViolations} kali</strong>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold ${
                        s.totalPoints === 0
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : s.totalPoints < 30
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                      }`}
                    >
                      {s.totalPoints} Poin
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
