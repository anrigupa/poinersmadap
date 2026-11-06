"use client";

import { Calendar, TrendingUp, ClipboardCheck, AlertCircle } from "lucide-react";
import { TeacherDashboardStats } from "@/features/teacher-dashboard/types";
import StatCard from "@/components/ui/StatCard";

interface TeacherMetricsCardsProps {
  stats: TeacherDashboardStats;
}

export default function TeacherMetricsCards({ stats }: TeacherMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Violations Today */}
      <StatCard
        value={stats.violationsToday}
        label="Pelanggaran Hari Ini"
        description="Laporan kedisiplinan yang Anda catat hari ini"
        badgeText="Hari Ini"
        badgeVariant="info"
        icon={Calendar}
        iconClassName="bg-blue-50 text-blue-700 border-blue-200"
      />

      {/* Violations This Month */}
      <StatCard
        value={stats.violationsThisMonth}
        label="Pelanggaran Bulan Ini"
        description="Akumulasi penindakan selama bulan berjalan"
        badgeText="Bulan Berjalan"
        badgeVariant="info"
        icon={TrendingUp}
        iconClassName="bg-indigo-50 text-indigo-700 border-indigo-200"
      />

      {/* Total Personal Submissions */}
      <StatCard
        value={stats.totalPersonalSubmissions}
        label="Total Pengajuan Anda"
        description="Arsip riwayat catatan pelanggaran pribadi"
        badgeText="Arsip Pribadi"
        badgeVariant="success"
        icon={ClipboardCheck}
        iconClassName="bg-emerald-50 text-emerald-800 border-emerald-200"
      />

      {/* Total Points Accrued */}
      <StatCard
        value={stats.totalPointsAccrued}
        label="Akumulasi Poin Dicatat"
        description="Total beban poin dari seluruh pengajuan Anda"
        badgeText="Poin Disiplin"
        badgeVariant="warning"
        icon={AlertCircle}
        iconClassName="bg-amber-50 text-amber-800 border-amber-200"
      />
    </div>
  );
}
