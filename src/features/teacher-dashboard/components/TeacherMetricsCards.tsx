"use client";

import { Calendar, TrendingUp, ClipboardCheck, AlertCircle } from "lucide-react";
import { TeacherDashboardStats } from "@/features/teacher-dashboard/types";

interface TeacherMetricsCardsProps {
  stats: TeacherDashboardStats;
}

export default function TeacherMetricsCards({ stats }: TeacherMetricsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Violations Today */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-blue-300 transition">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold text-slate-600">Pelanggaran Hari Ini</span>
          <span className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
            <Calendar className="w-4 h-4" />
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.violationsToday}
          </div>
          <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
            Hari ini
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Laporan yang Anda catat hari ini
        </p>
      </div>

      {/* Violations This Month */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold text-slate-600">Pelanggaran Bulan Ini</span>
          <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-4 h-4" />
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-extrabold text-indigo-600 tracking-tight">
            {stats.violationsThisMonth}
          </div>
          <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
            Bulan berjalan
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Akumulasi penindakan bulan ini
        </p>
      </div>

      {/* Total Personal Submissions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold text-slate-600">Total Pengajuan Anda</span>
          <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
            <ClipboardCheck className="w-4 h-4" />
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.totalPersonalSubmissions}
          </div>
          <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
            Riwayat
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Arsip catatan pelanggaran pribadi
        </p>
      </div>

      {/* Total Points Accrued */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-amber-300 transition">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold text-slate-600">Akumulasi Poin Dicatat</span>
          <span className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
            <AlertCircle className="w-4 h-4" />
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-extrabold text-amber-600 tracking-tight">
            {stats.totalPointsAccrued}
          </div>
          <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
            Poin Disiplin
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Total beban poin dari pengajuan Anda
        </p>
      </div>
    </div>
  );
}
