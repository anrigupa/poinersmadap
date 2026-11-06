"use client";

import { Edit, Trash2, KeyRound, GraduationCap, AlertTriangle, ShieldCheck, Award } from "lucide-react";
import { StudentItem } from "@/features/students/types";

interface StudentTableProps {
  items: StudentItem[];
  onEdit: (student: StudentItem) => void;
  onResetPassword: (student: StudentItem) => void;
  onDelete: (student: StudentItem) => void;
}

export default function StudentTable({
  items,
  onEdit,
  onResetPassword,
  onDelete,
}: StudentTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">Tidak ada data siswa</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Data siswa dengan kriteria pencarian atau filter yang dipilih tidak ditemukan.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Nama Siswa & Kontak</th>
              <th className="py-3.5 px-4">NISN / NIS</th>
              <th className="py-3.5 px-4">Kelas</th>
              <th className="py-3.5 px-4">Poin Pelanggaran</th>
              <th className="py-3.5 px-4">Poin Prestasi</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {items.map((student) => {
              const initials = student.fullName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              // Point severity coloring
              const violation = student.totalViolationPoints;
              let violationBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
              let violationLabel = "Aman";
              if (violation >= 75) {
                violationBadge = "bg-rose-50 text-rose-700 border-rose-200 font-bold";
                violationLabel = "Kritis (SP)";
              } else if (violation >= 30) {
                violationBadge = "bg-amber-50 text-amber-700 border-amber-200 font-semibold";
                violationLabel = "Peringatan";
              }

              // Status badge
              const isSp = ["sp1", "sp2", "sp3", "suspended"].includes(student.status);
              const statusBadge =
                student.status === "active"
                  ? "bg-slate-100 text-slate-700"
                  : student.status === "sp1"
                  ? "bg-amber-100 text-amber-800 font-semibold"
                  : student.status === "sp2"
                  ? "bg-orange-100 text-orange-800 font-bold"
                  : "bg-red-100 text-red-800 font-bold";

              return (
                <tr key={student.id} className="hover:bg-slate-50/60 transition group">
                  {/* Nama & Kontak */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                          {student.fullName}
                          <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                            {student.gender === "L" ? "Laki-laki" : "Perempuan"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* NISN / NIS */}
                  <td className="py-3.5 px-4 font-mono">
                    <div className="font-bold text-slate-800 text-xs">
                      {student.nisn || "-"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      NIS: {student.nis}
                    </div>
                  </td>

                  {/* Kelas */}
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      {student.className}
                    </span>
                  </td>

                  {/* Poin Pelanggaran */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] border ${violationBadge}`}
                      >
                        {violation >= 75 ? (
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                        ) : null}
                        {violation} Poin
                      </span>
                      <span className="text-[10px] text-slate-400 hidden xl:inline">
                        ({violationLabel})
                      </span>
                    </div>
                  </td>

                  {/* Poin Prestasi */}
                  <td className="py-3.5 px-4">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Award className="w-3 h-3 text-emerald-600" />
                      +{student.totalMeritPoints} Poin
                    </div>
                  </td>

                  {/* Status Disiplin */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${statusBadge}`}
                    >
                      {student.status.toUpperCase()}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100">
                      <button
                        onClick={() => onResetPassword(student)}
                        title="Reset Password Supabase Auth"
                        aria-label={`Reset password ${student.fullName}`}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(student)}
                        title="Edit Data Siswa"
                        aria-label={`Edit ${student.fullName}`}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(student)}
                        title="Hapus Siswa"
                        aria-label={`Hapus ${student.fullName}`}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
