"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Download, Calendar, ShieldCheck, Sparkles, Filter } from "lucide-react";
import MetricsWidgetGrid from "@/features/admin/components/MetricsWidgetGrid";
import ViolationsByMonthChart from "@/features/admin/components/ViolationsByMonthChart";
import ViolationsByCategoryChart from "@/features/admin/components/ViolationsByCategoryChart";
import RecentActivityTable from "@/features/admin/components/RecentActivityTable";
import { AdminOverviewData } from "@/features/admin/types/overview";

interface AdminOverviewClientProps {
  initialData: AdminOverviewData;
  adminName: string;
}

export default function AdminOverviewClient({ initialData, adminName }: AdminOverviewClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<AdminOverviewData>(initialData);
  const [selectedSemester, setSelectedSemester] = useState("ganjil");

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              SMADAP POINER &bull; Overview Eksekutif
            </span>
            <span className="text-slate-400 text-xs">&bull;</span>
            <span className="text-xs text-slate-500 font-medium">
              T.A. {data.academicPeriod.year} ({data.academicPeriod.semester})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Dashboard Ketertiban & Disiplin Siswa
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          >
            <option value="ganjil">Semester Ganjil 2024/2025</option>
            <option value="genap">Semester Genap 2023/2024</option>
          </select>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isPending}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition cursor-pointer disabled:opacity-50"
            title="Muat Ulang Metrik Realtime"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* 1. Widgets Grid: Total Students, Total Teachers, Total Violations, Monthly Violations */}
      <MetricsWidgetGrid metrics={data.metrics} dataSource={data.dataSource} />

      {/* 2. Charts Row: Violations by Month & Violations by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ViolationsByMonthChart data={data.monthlyStats} />
        </div>
        <div className="lg:col-span-5">
          <ViolationsByCategoryChart data={data.categoryStats} />
        </div>
      </div>

      {/* 3. Recent Activity Table */}
      <RecentActivityTable activities={data.recentActivities} />
    </div>
  );
}
