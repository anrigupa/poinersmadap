"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Info,
  Activity,
} from "lucide-react";
import { MonthlyTrendItem } from "@/features/student-dashboard/types";

interface ViolationTrendChartProps {
  data: MonthlyTrendItem[];
}

export default function ViolationTrendChart({ data }: ViolationTrendChartProps) {
  const [activeItem, setActiveItem] = useState<MonthlyTrendItem | null>(null);

  const maxPoints = Math.max(...data.map((d) => d.points), 20);
  const totalSemesterPoints = data.reduce((acc, cur) => acc + cur.points, 0);

  // Compare last two active months for trend
  const novPoints = data[4]?.points || 0;
  const oktPoints = data[3]?.points || 0;
  const diff = novPoints - oktPoints;
  const isDeclining = diff < 0; // Fewer violation points is good!

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Activity className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Tren Akumulasi Pelanggaran per Bulan
              </h3>
              <p className="text-xs text-slate-400">
                Semester Ganjil T.A 2026/2027 (Juli - Desember)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>6 Bulan Terakhir</span>
          </div>
        </div>

        {/* Dynamic Tooltip Info Box */}
        <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 min-h-[44px] flex items-center justify-between text-xs transition">
          {activeItem ? (
            <>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">
                  Bulan {activeItem.month}:
                </span>
                <span className="font-extrabold text-rose-600">
                  +{activeItem.points} Poin Pelanggaran
                </span>
              </div>
              <span className="text-slate-500 font-medium text-[11px]">
                {activeItem.incidentCount} Insiden tercatat
              </span>
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span>
                Arahkan kursor atau sentuh batang grafik untuk melihat rincian poin bulanan
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Modern Bar Chart Visual */}
      <div className="pt-2">
        <div className="h-44 flex items-end justify-between gap-3 sm:gap-6 px-2">
          {data.map((item, idx) => {
            const heightPercent =
              item.points > 0
                ? Math.max(Math.round((item.points / maxPoints) * 100), 14)
                : 6;

            const isCurrentMonth = item.month === "Nov";
            const isHovered = activeItem?.month === item.month;

            return (
              <div
                key={idx}
                onMouseEnter={() => setActiveItem(item)}
                onMouseLeave={() => setActiveItem(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                {/* Value Pill Above Bar */}
                <div
                  className={`text-[10px] font-bold font-mono transition-opacity mb-1 ${
                    isHovered || (isCurrentMonth && item.points > 0)
                      ? "opacity-100 text-rose-600"
                      : "opacity-0 group-hover:opacity-100 text-slate-400"
                  }`}
                >
                  {item.points > 0 ? `+${item.points}` : "0"}
                </div>

                {/* Animated Bar */}
                <div className="w-full max-w-[42px] bg-slate-100 rounded-t-xl overflow-hidden relative h-full flex items-end">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-xl transition-all duration-500 ${
                      item.points === 0
                        ? "bg-slate-200"
                        : isCurrentMonth
                        ? "bg-gradient-to-t from-blue-600 to-indigo-500 shadow-sm"
                        : "bg-gradient-to-t from-rose-500 to-amber-400 opacity-90 group-hover:opacity-100"
                    }`}
                  />
                </div>

                {/* Month Label */}
                <span
                  className={`text-[11px] font-semibold mt-2 transition ${
                    isCurrentMonth
                      ? "text-blue-700 font-bold"
                      : isHovered
                      ? "text-slate-900"
                      : "text-slate-400"
                  }`}
                >
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          {isDeclining ? (
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <TrendingDown className="w-3.5 h-3.5" />
              Tren Membaik ({diff} Poin)
            </span>
          ) : diff > 0 ? (
            <span className="flex items-center gap-1 text-amber-600 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              Penambahan (+{diff} Poin)
            </span>
          ) : (
            <span className="text-slate-500">Poin stabil</span>
          )}
        </div>

        <div className="text-slate-500">
          Akumulasi Semester:{" "}
          <strong className="text-slate-800">{totalSemesterPoints} Poin</strong>
        </div>
      </div>
    </div>
  );
}
