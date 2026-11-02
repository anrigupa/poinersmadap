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
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Riwayat Catatan Pelanggaran Siswa
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Total {items.length} Catatan Insiden
        </span>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 sm:px-6">Waktu Kejadian</th>
              <th className="py-3 px-4">Pasal / Jenis Pelanggaran</th>
              <th className="py-3 px-4">Poin</th>
              <th className="py-3 px-4">Catatan Kronologis & Bukti</th>
              <th className="py-3 px-4 sm:px-6 text-right">Guru Pelapor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {items.map((record) => {
              const isHeavy = record.categoryName === "Berat";
              const isMedium = record.categoryName === "Sedang";

              const catBadge = isHeavy
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : isMedium
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200";

              return (
                <tr key={record.id} className="hover:bg-slate-50/60 transition group">
                  {/* Incident Date */}
                  <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-700 whitespace-nowrap">
                    {record.formattedDate}
                  </td>

                  {/* Violation Rule */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {record.ruleCode}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catBadge}`}
                      >
                        {record.categoryName}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 max-w-xs">
                      {record.violationName}
                    </div>
                  </td>

                  {/* Points */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                      +{record.points} Poin
                    </span>
                  </td>

                  {/* Notes & Evidence */}
                  <td className="py-3.5 px-4 max-w-sm">
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
                        <span>Foto Barang Bukti</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </td>

                  {/* Reported By Teacher */}
                  <td className="py-3.5 px-4 sm:px-6 text-right font-medium text-slate-600 whitespace-nowrap">
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
