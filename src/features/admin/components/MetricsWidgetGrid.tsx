"use client";

import {
  AlertTriangle,
  Flame,
  Users,
  Activity,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import { DashboardMetrics } from "@/features/admin/types/overview";

interface MetricsWidgetGridProps {
  metrics: DashboardMetrics;
  dataSource?: "supabase_live";
  isLoading?: boolean;
}

export default function MetricsWidgetGrid({
  metrics,
  dataSource,
  isLoading = false,
}: MetricsWidgetGridProps) {
  const studentPercentage =
    metrics.totalStudents > 0
      ? ((metrics.studentsWithViolations / metrics.totalStudents) * 100).toFixed(1)
      : "0.0";

  const avgPointsPerViolatingStudent =
    metrics.studentsWithViolations > 0
      ? (metrics.totalViolationPoints / metrics.studentsWithViolations).toFixed(1)
      : "0.0";

  const changeVal = metrics.monthlyChangePercentage ?? 0;
  const formattedChange =
    changeVal > 0 ? `+${changeVal}%` : `${changeVal}%`;
  const isReduction = changeVal <= 0;

  const widgets = [
    {
      title: "Total Pelanggaran",
      value: metrics.totalViolations.toLocaleString("id-ID"),
      subtitle: `${metrics.monthlyViolations} kasus tercatat bulan ini`,
      icon: AlertTriangle,
      iconBg:
        "bg-amber-50 text-amber-600 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/60",
      badgeText:
        metrics.totalViolations === 0
          ? "Nihil Kasus"
          : `${metrics.totalViolations} Insiden`,
      badgeType: metrics.totalViolations === 0 ? "positive" : "warning",
    },
    {
      title: "Total Poin Pelanggaran",
      value: metrics.totalViolationPoints.toLocaleString("id-ID"),
      subtitle: `Rata-rata ${avgPointsPerViolatingStudent} poin / siswa pelanggar`,
      icon: Flame,
      iconBg:
        "bg-rose-50 text-rose-600 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800/60",
      badgeText: `${metrics.totalViolationPoints} Poin`,
      badgeType: metrics.totalViolationPoints > 500 ? "danger" : "neutral",
    },
    {
      title: "Siswa Pelanggar",
      value: metrics.studentsWithViolations.toLocaleString("id-ID"),
      subtitle: `${studentPercentage}% dari ${metrics.totalStudents.toLocaleString("id-ID")} total siswa`,
      icon: Users,
      iconBg:
        "bg-blue-50 text-blue-600 border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800/60",
      badgeText: `${(100 - Number(studentPercentage)).toFixed(1)}% Tertib`,
      badgeType: "positive",
    },
    {
      title: "Perubahan Bulanan %",
      value: formattedChange,
      subtitle:
        metrics.monthlyViolationTrend?.label ||
        `${metrics.monthlyViolations} bln ini vs ${metrics.previousMonthViolations} bln lalu`,
      icon: Activity,
      iconBg: isReduction
        ? "bg-emerald-50 text-emerald-600 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/60"
        : "bg-orange-50 text-orange-600 border-orange-200/80 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800/60",
      badgeText: isReduction ? "Membaik" : "Meningkat",
      badgeType: isReduction ? "positive" : "warning",
      isChangeCard: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs animate-pulse space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
              </div>
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-40 bg-slate-100 dark:bg-slate-800/70 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Indikator Utama Kedisiplinan (KPI)
        </h2>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Supabase PostgreSQL Live
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map((widget, idx) => {
          const badgeStyle =
            widget.badgeType === "positive"
              ? "text-emerald-900 bg-emerald-100 border-emerald-300 dark:text-emerald-200 dark:bg-emerald-950 dark:border-emerald-800"
              : widget.badgeType === "danger"
              ? "text-rose-950 bg-rose-100 border-rose-300 dark:text-rose-200 dark:bg-rose-950 dark:border-rose-800"
              : widget.badgeType === "warning"
              ? "text-amber-950 bg-amber-100 border-amber-300 dark:text-amber-200 dark:bg-amber-950 dark:border-amber-800"
              : "text-slate-800 bg-slate-100 border-slate-300 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700";

          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeStyle}`}
                >
                  {widget.isChangeCard ? (
                    changeVal === 0 ? (
                      <Minus className="w-3 h-3" />
                    ) : changeVal < 0 ? (
                      <TrendingDown className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <TrendingUp className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    )
                  ) : null}
                  <span>{widget.badgeText}</span>
                </div>
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${widget.iconBg} group-hover:scale-105 transition-transform`}
                >
                  <widget.icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                {/* 1. Value */}
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
                  {widget.value}
                </div>

                {/* 2. Label */}
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2">
                  {widget.title}
                </div>

                {/* 3. Description */}
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal truncate">
                  {widget.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
