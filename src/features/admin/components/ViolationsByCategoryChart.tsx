"use client";

import { PieChart, AlertCircle, Inbox } from "lucide-react";
import { CategoryViolationStat } from "@/features/admin/types/overview";

interface ViolationsByCategoryChartProps {
  data: CategoryViolationStat[];
  selectedCategory?: string;
  onSelectCategory?: (categoryName: string) => void;
  isLoading?: boolean;
}

export default function ViolationsByCategoryChart({
  data,
  selectedCategory = "all",
  onSelectCategory,
  isLoading = false,
}: ViolationsByCategoryChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between h-full animate-pulse">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-1.5">
                <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800/70 rounded" />
              </div>
            </div>
            <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          </div>
          <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="mt-6 space-y-2.5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-14 w-full bg-slate-100 dark:bg-slate-800/60 rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  const totalIncidents = data.reduce((acc, curr) => acc + curr.count, 0);
  const totalPoints = data.reduce((acc, curr) => acc + curr.points, 0);
  const isEmpty = data.length === 0 || totalIncidents === 0;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shrink-0">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Kategori Pelanggaran
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Proporsi tingkat keparahan tata tertib
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
            {totalIncidents} Kasus &bull; {totalPoints} Poin
          </span>
        </div>

        {/* Stacked Multi-Segment Progress Bar */}
        {!isEmpty && (
          <div className="mt-5">
            <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
              {data.map((cat, idx) => (
                <div
                  key={idx}
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.colorCode,
                  }}
                  className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full hover:brightness-110"
                />
              ))}
            </div>

            {/* Quick Category Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              {data.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.colorCode }}
                  />
                  <span>
                    {cat.categoryName} ({cat.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Breakdown Cards or Empty State */}
      {isEmpty ? (
        <div className="my-6 py-10 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
            <Inbox className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Belum ada statistik tersedia
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mt-0.5">
            Proporsi kategori pelanggaran akan tampil setelah ada insiden tercatat.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-2.5">
          {data.map((cat, idx) => {
            const isRingan = cat.categoryName === "Ringan";
            const isSedang = cat.categoryName === "Sedang";
            const isActive =
              selectedCategory.toLowerCase() === cat.categoryName.toLowerCase();

            const bgClass = isRingan
              ? "bg-blue-50/70 border-blue-200/70 dark:bg-blue-950/30 dark:border-blue-900/60"
              : isSedang
              ? "bg-amber-50/70 border-amber-200/70 dark:bg-amber-950/30 dark:border-amber-900/60"
              : "bg-rose-50/70 border-rose-200/70 dark:bg-rose-950/30 dark:border-rose-900/60";

            const badgeClass = isRingan
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
              : isSedang
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300"
              : "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300";

            return (
              <div
                key={idx}
                onClick={() =>
                  onSelectCategory &&
                  onSelectCategory(isActive ? "all" : cat.categoryName)
                }
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  onSelectCategory ? "cursor-pointer" : ""
                } ${
                  isActive
                    ? "ring-2 ring-blue-500 bg-white dark:bg-slate-800 shadow-xs"
                    : `${bgClass} hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-xs`
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs text-white shadow-2xs"
                    style={{ backgroundColor: cat.colorCode }}
                  >
                    {cat.categoryName[0]}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Pelanggaran {cat.categoryName}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}
                      >
                        {cat.count} Kasus
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Total Bobot Sanksi: {cat.points} Poin
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-slate-800 dark:text-slate-100">
                    {cat.percentage}%
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">
                    dari total
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          Pelanggaran Berat langsung memicu rapat komite &amp; pemanggilan orang tua (SP2/SP3).
        </span>
      </div>
    </div>
  );
}
