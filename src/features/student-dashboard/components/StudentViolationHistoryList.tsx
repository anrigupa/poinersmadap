"use client";

import {
  Clock,
  AlertTriangle,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  FileText,
} from "lucide-react";
import { StudentViolationHistoryItem } from "@/features/student-dashboard/types";

interface StudentViolationHistoryListProps {
  items: StudentViolationHistoryItem[];
}

export default function StudentViolationHistoryList({
  items,
}: StudentViolationHistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">
          Tidak ada catatan pelanggaran
        </h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Selamat! Rekam jejak kedisiplinan Anda bersih tanpa pelanggaran tata tertib sekolah.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800 tracking-tight">
              Riwayat Catatan Pelanggaran Siswa
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar insiden dan poin kedisiplinan yang tercatat di buku saku sekolah
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
          Total {items.length} Catatan Insiden
        </span>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Waktu Kejadian</th>
              <th className="py-3.5 px-4">Pasal / Jenis Pelanggaran</th>
              <th className="py-3.5 px-4">Poin</th>
              <th className="py-3.5 px-4">Catatan Kronologis &amp; Bukti</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Guru Pelapor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {items.map((record) => {
              const isHeavy = record.categoryName === "Berat";
              const isMedium = record.categoryName === "Sedang";

              const catBadge = isHeavy
                ? "bg-rose-100 text-rose-950 border-rose-300"
                : isMedium
                ? "bg-amber-100 text-amber-950 border-amber-300"
                : "bg-blue-100 text-blue-950 border-blue-300";

              return (
                <tr key={record.id} className="hover:bg-slate-50/75 transition-colors group">
                  {/* Incident Date */}
                  <td className="py-4 px-4 sm:px-6 font-medium text-slate-700 whitespace-nowrap text-xs sm:text-sm">
                    {record.formattedDate}
                  </td>

                  {/* Violation Rule */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {record.ruleCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catBadge}`}
                      >
                        {record.categoryName}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900 max-w-xs text-xs sm:text-sm">
                      {record.violationName}
                    </div>
                  </td>

                  {/* Points */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-950 border border-rose-300">
                      +{record.points} Poin
                    </span>
                  </td>

                  {/* Notes & Evidence */}
                  <td className="py-4 px-4 max-w-sm">
                    <p className="text-slate-600 line-clamp-2 text-xs leading-relaxed">
                      {record.notes}
                    </p>
                    {record.evidenceUrl && (
                      <a
                        href={record.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 hover:underline mt-1 font-semibold"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>Foto Barang Bukti</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </td>

                  {/* Reported By Teacher */}
                  <td className="py-4 px-4 sm:px-6 text-right font-medium text-slate-700 whitespace-nowrap text-xs sm:text-sm">
                    {record.reportedByName}
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
