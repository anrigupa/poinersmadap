"use client";

import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Image as ImageIcon,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { TeacherViolationRecord } from "@/features/teacher-dashboard/types";

interface RecentSubmissionsTableProps {
  items: TeacherViolationRecord[];
}

export default function RecentSubmissionsTable({
  items,
}: RecentSubmissionsTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">
          Belum ada catatan pelanggaran pribadi
        </h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Anda belum menginput laporan pelanggaran siswa. Gunakan tombol &quot;Catat Pelanggaran (Quick Action)&quot; untuk membuat laporan baru.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Siswa & Kelas</th>
              <th className="py-3.5 px-4">Aturan & Pelanggaran</th>
              <th className="py-3.5 px-4">Poin</th>
              <th className="py-3.5 px-4">Waktu Insiden</th>
              <th className="py-3.5 px-4">Kronologis / Bukti</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {items.map((record) => {
              const initials = record.studentName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              // Category color
              const catBadge =
                record.categoryName === "Berat"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : record.categoryName === "Sedang"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200";

              return (
                <tr key={record.id} className="hover:bg-slate-50/60 transition group">
                  {/* Siswa & Kelas */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {record.studentName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span className="font-mono">NIS: {record.studentNis}</span>
                          <span>•</span>
                          <span className="font-medium text-slate-600">
                            {record.className}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Aturan & Pelanggaran */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {record.ruleCode}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catBadge}`}
                      >
                        {record.categoryName}
                      </span>
                    </div>
                    <div className="text-slate-800 font-medium max-w-xs truncate">
                      {record.violationName}
                    </div>
                  </td>

                  {/* Poin */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      +{record.points} Poin
                    </span>
                  </td>

                  {/* Waktu Insiden */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium text-xs">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{record.formattedDate}</span>
                    </div>
                  </td>

                  {/* Kronologis & Bukti */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-slate-600 line-clamp-2 text-[11px] leading-relaxed">
                      {record.notes}
                    </p>
                    {record.evidenceUrl && (
                      <a
                        href={record.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 hover:underline mt-1 font-medium"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>Lihat Bukti Foto</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    {record.status === "confirmed" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Dikonfirmasi
                      </span>
                    ) : record.status === "appealed" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <ShieldAlert className="w-3 h-3 text-amber-600" />
                        Banding
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                        Dibatalkan
                      </span>
                    )}
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
