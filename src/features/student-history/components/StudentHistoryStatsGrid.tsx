"use client";

import {
  FileText,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Clock,
  Award,
} from "lucide-react";
import { StudentHistoryStats } from "@/features/student-history/types";

interface StudentHistoryStatsGridProps {
  stats: StudentHistoryStats;
}

export default function StudentHistoryStatsGrid({
  stats,
}: StudentHistoryStatsGridProps) {
  const isAman = stats.disciplinaryLevel === "Aman";
  const isSp1 = stats.disciplinaryLevel === "SP1";
  const isSp2 = stats.disciplinaryLevel === "SP2";

  const levelColor = isAman
    ? "text-emerald-600 bg-emerald-50 border-emerald-200"
    : isSp1
    ? "text-amber-600 bg-amber-50 border-amber-200"
    : isSp2
    ? "text-orange-600 bg-orange-50 border-orange-200"
    : "text-rose-600 bg-rose-50 border-rose-200";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Total Incidents */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-md border border-blue-300">
            Buku Saku
          </span>
          <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
            <FileText className="w-4 h-4" />
          </span>
        </div>
        <div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
            {stats.totalIncidents}
          </div>
          <div className="text-sm font-semibold text-slate-800 mt-1.5">
            Total Insiden
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Insiden tercatat di buku saku</p>
        </div>
      </div>

      {/* Total Accrued Points */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-rose-950 bg-rose-100 px-2.5 py-0.5 rounded-md border border-rose-300">
            Poin Pelanggaran
          </span>
          <span className="p-2 rounded-xl bg-rose-50 text-rose-700">
            <AlertTriangle className="w-4 h-4" />
          </span>
        </div>
        <div>
          <div className="text-3xl font-extrabold text-rose-600 font-mono tracking-tight">
            {stats.totalPoints}
          </div>
          <div className="text-sm font-semibold text-slate-800 mt-1.5">
            Akumulasi Poin
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Beban poin kedisiplinan</p>
        </div>
      </div>

      {/* Disciplinary Level */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-300">
            Status Disiplin
          </span>
          <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
          </span>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.disciplinaryLevel}
          </div>
          <div className="text-sm font-semibold text-slate-800 mt-1.5">
            Status Level Sanksi
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Tingkat pembinaan saat ini</p>
        </div>
      </div>

      {/* Latest Incident Date */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-300">
            Aktivitas Terakhir
          </span>
          <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <Clock className="w-4 h-4" />
          </span>
        </div>
        <div>
          <div className="text-base sm:text-lg font-bold text-slate-900 truncate">
            {stats.latestDate}
          </div>
          <div className="text-sm font-semibold text-slate-800 mt-1.5">
            Pelanggaran Terakhir
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Waktu penindakan terakhir</p>
        </div>
      </div>
    </div>
  );
}
