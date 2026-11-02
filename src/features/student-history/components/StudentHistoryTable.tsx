"use client";

import {
  Calendar,
  AlertTriangle,
  User,
  FileText,
  Camera,
  ExternalLink,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { StudentHistoryRecord } from "@/features/student-history/types";

interface StudentHistoryTableProps {
  items: StudentHistoryRecord[];
  onSelectRecord: (record: StudentHistoryRecord) => void;
}

export default function StudentHistoryTable({
  items,
  onSelectRecord,
}: StudentHistoryTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">
          Tidak ada data riwayat pelanggaran
        </h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Tidak ditemukan catatan insiden dengan kriteria pencarian atau filter yang dipilih.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {/* Date */}
              <th className="py-3.5 px-4 sm:px-6">Waktu Kejadian</th>
              {/* Category */}
              <th className="py-3.5 px-4">Kategori</th>
              {/* Violation */}
              <th className="py-3.5 px-4">Pasal / Jenis Pelanggaran</th>
              {/* Teacher */}
              <th className="py-3.5 px-4">Guru Pelapor</th>
              {/* Points */}
              <th className="py-3.5 px-4">Poin</th>
              {/* Notes */}
              <th className="py-3.5 px-4">Catatan Kronologis</th>
              {/* Action */}
              <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
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
                <tr
                  key={record.id}
                  onClick={() => onSelectRecord(record)}
                  className="hover:bg-slate-50/60 transition group cursor-pointer"
                >
                  {/* 1. Date */}
                  <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                    <div className="font-semibold text-slate-800">
                      {record.formattedDate}
                    </div>
                    {record.location && (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {record.location}
                      </div>
                    )}
                  </td>

                  {/* 2. Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${catBadge}`}
                    >
                      {record.categoryName}
                    </span>
                  </td>

                  {/* 3. Violation */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 inline-block mb-1">
                      {record.ruleCode}
                    </div>
                    <div className="font-bold text-slate-900 line-clamp-1">
                      {record.violationName}
                    </div>
                  </td>

                  {/* 4. Teacher */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-medium text-slate-800">
                      {record.teacherName}
                    </div>
                    {record.teacherNip && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        NIP: {record.teacherNip}
                      </div>
                    )}
                  </td>

                  {/* 5. Points */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                      +{record.points} Poin
                    </span>
                  </td>

                  {/* 6. Notes */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-slate-600 line-clamp-2 text-[11px] leading-relaxed">
                      {record.notes}
                    </p>
                    {record.evidenceUrl && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-medium mt-0.5">
                        <Camera className="w-3 h-3" /> Bukti Foto Terlampir
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRecord(record);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Lihat Detail Lengkap"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
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
