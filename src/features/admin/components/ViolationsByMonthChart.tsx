"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, Calendar, Info } from "lucide-react";
import { MonthlyViolationStat } from "@/features/admin/types/overview";

interface ViolationsByMonthChartProps {
  data: MonthlyViolationStat[];
}

export default function ViolationsByMonthChart({ data }: ViolationsByMonthChartProps) {
  const [activeItem, setActiveItem] = useState<MonthlyViolationStat | null>(null);

  const maxCount = Math.max(...data.map((d) => d.count), 40);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Tren Pelanggaran per Bulan</h3>
              <p className="text-[11px] text-slate-400">Distribusi insiden semester berjalan (Juli - Desember)</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>T.A 2024/2025</span>
          </div>
        </div>

        {/* Dynamic Tooltip Box */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/60 min-h-[46px] flex items-center justify-between text-xs">
          {activeItem ? (
            <>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Bulan {activeItem.month}:</span>
                <span className="text-blue-600 font-bold">{activeItem.count} Insiden</span>
              </div>
              <span className="text-slate-500 font-medium">Total Akumulasi: {activeItem.points} Poin</span>
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Info className="w-3.5 h-3.5" />
              <span>Arahkan kursor pada batang grafik untuk rincian insiden & poin per bulan</span>
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart Visual */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="h-48 flex items-end justify-between gap-3 sm:gap-6 px-2">
          {data.map((item, idx) => {
            const heightPercent = Math.round((item.count / maxCount) * 100);
            const isHovered = activeItem?.month === item.month;

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end cursor-pointer group"
                onMouseEnter={() => setActiveItem(item)}
                onMouseLeave={() => setActiveItem(null)}
              >
                {/* Bar Value Indicator */}
                <div
                  className={`text-[11px] font-bold transition-all ${
                    isHovered ? "text-blue-600 -translate-y-0.5" : "text-slate-400 opacity-80"
                  }`}
                >
                  {item.count}
                </div>

                {/* Animated Column Bar */}
                <div className="w-full max-w-[42px] bg-slate-100 rounded-t-xl overflow-hidden h-full flex items-end">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-xl transition-all duration-300 ${
                      isHovered
                        ? "bg-gradient-to-t from-blue-700 to-indigo-600 shadow-md shadow-blue-500/25"
                        : "bg-gradient-to-t from-blue-600 to-indigo-500 opacity-90 group-hover:opacity-100"
                    }`}
                  />
                </div>

                {/* Month Label */}
                <span
                  className={`text-xs font-semibold mt-1 transition-colors ${
                    isHovered ? "text-blue-600 font-bold" : "text-slate-500"
                  }`}
                >
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart Footer Indicator */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-blue-600" />
          <span>Jumlah Kasus Terkonfirmasi</span>
        </div>
        <span>Rata-rata: 24 Kasus / Bulan</span>
      </div>
    </div>
  );
}
