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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Incidents */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold text-slate-600">
            Total Insiden
          </span>
          <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <FileText className="w-4 h-4" />
          </span>
        </div>
        <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {stats.totalIncidents}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Insiden tercatat di buku saku</p>
      </div>

      {/* Total Accrued Points */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold text-slate-600">
            Akumulasi Poin
          </span>
          <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle className="w-4 h-4" />
          </span>
        </div>
        <div className="text-3xl font-extrabold text-rose-600 tracking-tight">
          {stats.totalPoints}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Beban poin kedisiplinan</p>
      </div>

      {/* Disciplinary Level */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold text-slate-600">
            Status Level Sanksi
          </span>
          <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="w-4 h-4" />
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-base font-extrabold px-2.5 py-0.5 rounded-lg border ${levelColor}`}>
            {stats.disciplinaryLevel}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Tingkat pembinaan saat ini</p>
      </div>

      {/* Latest Incident Date */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold text-slate-600">
            Pelanggaran Terakhir
          </span>
          <span className="p-2 rounded-xl bg-slate-100 text-slate-600">
            <Clock className="w-4 h-4" />
          </span>
        </div>
        <div className="text-xs font-bold text-slate-800 truncate">
          {stats.latestDate}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Waktu penindakan terakhir</p>
      </div>
    </div>
  );
}
