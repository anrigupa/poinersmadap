"use client";

import { Edit, Trash2, KeyRound, Users, GraduationCap, Phone, Headset, BookOpen } from "lucide-react";
import { TeacherItem } from "@/features/teachers/types";

interface TeacherTableProps {
  items: TeacherItem[];
  onEdit: (teacher: TeacherItem) => void;
  onResetPassword: (teacher: TeacherItem) => void;
  onDelete: (teacher: TeacherItem) => void;
}

export default function TeacherTable({
  items,
  onEdit,
  onResetPassword,
  onDelete,
}: TeacherTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Users className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">Tidak ada data guru</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Data guru yang dicari tidak ditemukan atau belum ditambahkan ke sistem.
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
              <th className="py-3.5 px-4 sm:px-6">Nama Guru & Email</th>
              <th className="py-3.5 px-4">NIP</th>
              <th className="py-3.5 px-4">Nomor HP</th>
              <th className="py-3.5 px-4">Jenis Guru</th>
              <th className="py-3.5 px-4">Tugas / Peran</th>
              <th className="py-3.5 px-4">Kelas / Bidang</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {items.map((teacher) => {
              const initials = teacher.fullName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              const isCounselor =
                teacher.teacher_type === "counselor" || teacher.specialization === "guru_bk";
              const isBk = teacher.specialization === "guru_bk";
              const isPiket = teacher.specialization === "guru_piket";
              const isWali = teacher.specialization === "wali_kelas";

              const roleBadge = isBk
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : isPiket
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : isWali
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-700 border-slate-200";

              const roleLabel = isBk
                ? "Bimbingan Konseling"
                : isPiket
                ? "Guru Piket"
                : isWali
                ? "Wali Kelas"
                : "Guru Mapel";

              return (
                <tr key={teacher.id} className="hover:bg-slate-50/60 transition group">
                  {/* Nama & Email */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${
                          isCounselor
                            ? "from-purple-600 to-indigo-600"
                            : "from-blue-600 to-indigo-600"
                        } text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{teacher.fullName}</div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {teacher.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* NIP */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                      {teacher.nip}
                    </span>
                  </td>

                  {/* Nomor HP */}
                  <td className="py-3.5 px-4">
                    {teacher.phoneNumber ? (
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-lg">
                        <Phone className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>{teacher.phoneNumber}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Belum diisi</span>
                    )}
                  </td>

                  {/* Jenis Guru (teacher_type) */}
                  <td className="py-3.5 px-4">
                    {isCounselor ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-100/90 text-purple-800 border border-purple-200">
                        <Headset className="w-3 h-3" />
                        <span>Guru BK</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <BookOpen className="w-3 h-3" />
                        <span>Guru Mata Pelajaran</span>
                      </span>
                    )}
                  </td>

                  {/* Tugas / Peran */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${roleBadge}`}>
                      {roleLabel}
                    </span>
                  </td>

                  {/* Kelas Binaan */}
                  <td className="py-3.5 px-4 text-slate-600">
                    {teacher.assignedClass ? (
                      <span className="inline-flex items-center gap-1 font-medium text-xs text-slate-800">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        <span>{teacher.assignedClass}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">-</span>
                    )}
                  </td>

                  {/* Aksi */}
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onResetPassword(teacher)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                        title="Reset Kata Sandi Akun Auth"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(teacher)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                        title="Edit data guru"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(teacher)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Hapus akun guru"
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
