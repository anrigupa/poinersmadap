"use client";

import { useState } from "react";
import { BarChart3, Calendar, Info, Inbox } from "lucide-react";
import { MonthlyViolationStat } from "@/features/admin/types/overview";

interface ViolationsByMonthChartProps {
  data: MonthlyViolationStat[];
  academicYear?: string;
  semester?: string;
  isLoading?: boolean;
}

export default function ViolationsByMonthChart({
  data,
  academicYear = "2024/2025",
  semester = "Semester Ganjil",
  isLoading = false,
}: ViolationsByMonthChartProps) {
  const [activeItem, setActiveItem] = useState<MonthlyViolationStat | null>(null);
  const [viewMode, setViewMode] = useState<"count" | "points">("count");

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between h-full animate-pulse">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-1.5">
                <div className="h-4 w-44 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-56 bg-slate-100 dark:bg-slate-800/70 rounded" />
              </div>
            </div>
            <div className="h-7 w-28 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          </div>
          <div className="h-11 w-full bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 h-48 flex items-end justify-between gap-4 px-2">
          {[45, 75, 60, 85, 65, 30].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div
                style={{ height: `${h}%` }}
                className="w-full max-w-[42px] bg-slate-200 dark:bg-slate-800 rounded-t-xl"
              />
              <div className="h-3 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalCount = data.reduce((acc, d) => acc + d.count, 0);
  const totalPoints = data.reduce((acc, d) => acc + d.points, 0);
  const isEmpty = data.length === 0 || (totalCount === 0 && totalPoints === 0);

  const maxValue =
    viewMode === "count"
      ? Math.max(...data.map((d) => d.count), 10)
      : Math.max(...data.map((d) => d.points), 50);

  const activeMonthsCount = Math.max(data.filter((d) => d.count > 0).length, 1);
  const avgCountPerMonth = Math.round(totalCount / activeMonthsCount);
  const avgPointsPerMonth = Math.round(totalPoints / activeMonthsCount);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Tren Pelanggaran Bulanan
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Distribusi insiden &amp; poin pada {semester} ({academicYear})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("count")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                viewMode === "count"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Jumlah Kasus
            </button>
            <button
              type="button"
              onClick={() => setViewMode("points")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                viewMode === "points"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Total Poin
            </button>
          </div>
        </div>

        {/* Dynamic Tooltip Box */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 min-h-[46px] flex flex-wrap items-center justify-between gap-2 text-xs">
          {activeItem ? (
            <>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">
                  Bulan {activeItem.fullMonthName || activeItem.month}:
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  {activeItem.count} Kasus
                </span>
              </div>
              <span className="text-slate-600 dark:text-slate-300 font-semibold">
                Akumulasi Bobot: {activeItem.points} Poin
              </span>
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
              <Info className="w-3.5 h-3.5 shrink-0 text-blue-500" />
              <span>
                Sentuh atau arahkan kursor pada batang grafik untuk rincian insiden &amp; poin bulanan
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart Visual or Empty State */}
      {isEmpty ? (
        <div className="my-6 py-10 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
            <Inbox className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Belum Ada Data Tren Bulanan
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mt-0.5">
            Grafik tren bulanan akan muncul secara otomatis setelah laporan pelanggaran dicatat.
          </p>
        </div>
      ) : (
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-5 px-1 sm:px-2">
            {data.map((item, idx) => {
              const rawVal = viewMode === "count" ? item.count : item.points;
              const heightPercent =
                rawVal > 0 ? Math.max(Math.round((rawVal / maxValue) * 100), 8) : 4;
              const isSelected = activeItem?.month === item.month;

              return (
                <button
                  type="button"
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end cursor-pointer group focus:outline-none"
                  onMouseEnter={() => setActiveItem(item)}
                  onMouseLeave={() => setActiveItem(null)}
                  onClick={() =>
                    setActiveItem((prev) => (prev?.month === item.month ? null : item))
                  }
                >
                  {/* Bar Value Indicator */}
                  <div
                    className={`text-[11px] font-bold transition-all ${
                      isSelected
                        ? "text-blue-600 dark:text-blue-400 -translate-y-0.5 scale-105"
                        : "text-slate-500 dark:text-slate-400 opacity-85"
                    }`}
                  >
                    {rawVal}
                  </div>

                  {/* Animated Column Bar */}
                  <div className="w-full max-w-[44px] bg-slate-100 dark:bg-slate-800 rounded-t-xl overflow-hidden h-full flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-xl transition-all duration-300 ${
                        rawVal === 0
                          ? "bg-slate-200 dark:bg-slate-700"
                          : isSelected
                          ? "bg-gradient-to-t from-blue-700 to-indigo-500 shadow-md shadow-blue-500/25"
                          : "bg-gradient-to-t from-blue-600 to-indigo-500 opacity-90 group-hover:opacity-100"
                      }`}
                    />
                  </div>

                  {/* Month Label */}
                  <span
                    className={`text-xs font-semibold mt-1 transition-colors ${
                      isSelected
                        ? "text-blue-600 dark:text-blue-400 font-bold"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {item.month}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chart Footer Indicator */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-blue-600 inline-block" />
          <span>
            {viewMode === "count"
              ? `Total: ${totalCount} Kasus Terkonfirmasi`
              : `Total: ${totalPoints} Poin Pelanggaran`}
          </span>
        </div>
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Rata-rata:{" "}
          {viewMode === "count"
            ? `${avgCountPerMonth} Kasus / Bulan`
            : `${avgPointsPerMonth} Poin / Bulan`}
        </span>
      </div>
    </div>
  );
}
