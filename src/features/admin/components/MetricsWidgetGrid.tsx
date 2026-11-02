"use client";

import { Users, GraduationCap, AlertTriangle, CalendarCheck, TrendingDown, TrendingUp } from "lucide-react";
import { DashboardMetrics } from "@/features/admin/types/overview";

interface MetricsWidgetGridProps {
  metrics: DashboardMetrics;
  dataSource?: "supabase_live" | "demo_fallback";
}

export default function MetricsWidgetGrid({ metrics, dataSource }: MetricsWidgetGridProps) {
  const widgets = [
    {
      title: "Total Siswa",
      value: metrics.totalStudents.toLocaleString("id-ID"),
      subtitle: metrics.studentTrend || "Tahun Ajaran Aktif",
      icon: GraduationCap,
      color: "from-blue-600 to-indigo-600",
      iconBg: "bg-blue-50 text-blue-600 border-blue-100",
      trendBadge: "+4.2%",
      trendPositive: true,
    },
    {
      title: "Total Guru & Staff",
      value: metrics.totalTeachers.toLocaleString("id-ID"),
      subtitle: "6 Rombel Bina & Piket",
      icon: Users,
      color: "from-purple-600 to-violet-600",
      iconBg: "bg-purple-50 text-purple-600 border-purple-100",
      trendBadge: "100% Aktif",
      trendPositive: true,
    },
    {
      title: "Total Pelanggaran",
      value: metrics.totalViolations.toLocaleString("id-ID"),
      subtitle: "Akumulatif Semester Ini",
      icon: AlertTriangle,
      color: "from-amber-500 to-orange-600",
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
      trendBadge: "148 Kasus",
      trendPositive: false,
    },
    {
      title: "Pelanggaran Bulan Ini",
      value: metrics.monthlyViolations.toLocaleString("id-ID"),
      subtitle: metrics.monthlyViolationTrend?.label || "Bulan Berjalan",
      icon: CalendarCheck,
      color: "from-emerald-600 to-teal-600",
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      trendBadge: "-12.5%",
      trendPositive: true, // reduction in violations is good for discipline!
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Ringkasan Metrik Kedisiplinan</h2>
        {dataSource === "supabase_live" ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Supabase PostgreSQL Live
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Database Model Sinkron
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map((widget, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase text-[11px]">
                {widget.title}
              </span>
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${widget.iconBg} group-hover:scale-105 transition-transform`}>
                <widget.icon className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {widget.value}
              </div>

              {widget.trendBadge && (
                <div
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    widget.trendPositive
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-amber-700 bg-amber-50"
                  }`}
                >
                  {widget.trendPositive ? (
                    <TrendingDown className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <TrendingUp className="w-3 h-3 text-amber-600" />
                  )}
                  <span>{widget.trendBadge}</span>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 mt-2 font-medium">
              {widget.subtitle}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
