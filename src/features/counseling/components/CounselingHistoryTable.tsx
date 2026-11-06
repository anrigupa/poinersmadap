"use client";

import { useState } from "react";
import {
  Clock,
  User,
  GraduationCap,
  Sparkles,
  MinusCircle,
  Eye,
  X,
  FileText,
  Calendar,
  ShieldCheck,
  Search,
} from "lucide-react";
import { CounselingRecordItem } from "@/features/counseling/types";

interface CounselingHistoryTableProps {
  items: CounselingRecordItem[];
}

export default function CounselingHistoryTable({
  items,
}: CounselingHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<CounselingRecordItem | null>(null);

  const filtered = items.filter((item) => {
    if (!searchTerm.trim()) return true;
    const s = searchTerm.toLowerCase();
    return (
      item.studentName.toLowerCase().includes(s) ||
      item.studentNis.toLowerCase().includes(s) ||
      item.className.toLowerCase().includes(s) ||
      item.counselingType.toLowerCase().includes(s) ||
      item.counselorName.toLowerCase().includes(s) ||
      item.action.toLowerCase().includes(s)
    );
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden space-y-0">
      {/* Search Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Riwayat Layanan Konseling & Pemotongan Poin
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Daftar audit seluruh kegiatan bimbingan dan pemotongan poin disiplin oleh Guru BK.
          </p>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari siswa, guru BK, atau tindakan..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            {searchTerm ? "Tidak ada riwayat yang cocok" : "Belum ada riwayat konseling"}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? "Coba ubah kata kunci pencarian Anda."
              : "Catat sesi pembinaan pertama menggunakan tombol Catat Sesi Konseling di atas."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Siswa</th>
                  <th className="py-3.5 px-4">Tindakan / Jenis Bimbingan</th>
                  <th className="py-3.5 px-4 text-center">Pengurangan Poin</th>
                  <th className="py-3.5 px-4">Guru BK</th>
                  <th className="py-3.5 px-4 text-center w-28">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
                {filtered.map((item, index) => {
                  const formattedDate = new Date(item.counselingDate).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition group"
                    >
                      {/* No */}
                      <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-400">
                        {index + 1}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* Student */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                          {item.studentName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          NIS: {item.studentNis} • {item.className}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                          {item.action}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.counselingType}
                        </div>
                      </td>

                      {/* Point Reduction */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {item.pointReduction > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <MinusCircle className="w-3 h-3 text-emerald-600" />
                            -{item.pointReduction} Poin
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                            0 Poin (Konseling)
                          </span>
                        )}
                      </td>

                      {/* Teacher */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                          {item.counselorName}
                        </div>
                        <div className="text-[11px] text-slate-400">Guru Bimbingan Konseling</div>
                      </td>

                      {/* Detail Button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedRecord(item)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-900/50 transition active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Audit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((item, index) => {
              const formattedDate = new Date(item.counselingDate).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });

              return (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {item.studentName}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        NIS: {item.studentNis} • {item.className}
                      </p>
                    </div>

                    {item.pointReduction > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <MinusCircle className="w-3 h-3" />
                        -{item.pointReduction} Poin
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                        Konseling
                      </span>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs space-y-1">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.action}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Oleh: {item.counselorName}</span>
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => setSelectedRecord(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Detail Audit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Audit Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Audit Jejak Layanan Konseling
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {/* Student Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Siswa Terbina</p>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    {selectedRecord.studentName}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">
                    NIS: {selectedRecord.studentNis} • {selectedRecord.className}
                  </p>
                </div>
                {selectedRecord.pointReduction > 0 && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    -{selectedRecord.pointReduction} Poin
                  </span>
                )}
              </div>

              {/* Point Transition Audit Box */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-blue-50/50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/40 text-xs">
                <div>
                  <span className="text-slate-500">Poin Sebelum Konseling:</span>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedRecord.previousPoints} Poin
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Poin Setelah Pemotongan:</span>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {selectedRecord.resultingPoints} Poin
                  </div>
                </div>
              </div>

              {/* Counseling Type & Date */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  Jenis Konseling & Tanggal
                </span>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {selectedRecord.counselingType}
                </div>
                <div className="text-slate-500 text-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {new Date(selectedRecord.counselingDate).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  Catatan Pembinaan & Komitmen Siswa
                </span>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                  {selectedRecord.description}
                </div>
              </div>

              {/* Reduction Reason & Evidence */}
              {selectedRecord.reductionReason && (
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">
                    Alasan Pemotongan Poin
                  </span>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                    {selectedRecord.reductionReason}
                  </div>
                </div>
              )}

              {selectedRecord.evidenceNotes && (
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">
                    Catatan Bukti / Lampiran
                  </span>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                    {selectedRecord.evidenceNotes}
                  </div>
                </div>
              )}

              {/* Footer Audit Signature */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Konselor: <strong>{selectedRecord.counselorName}</strong></span>
                <span className="font-mono">ID: {selectedRecord.id}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
