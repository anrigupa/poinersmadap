"use client";

import Link from "next/link";
import { ListOrdered, ArrowUpRight, Inbox } from "lucide-react";
import { TopViolationStat } from "@/features/admin/types/overview";

interface TopViolationsChartProps {
  data: TopViolationStat[];
  isLoading?: boolean;
}

export default function TopViolationsChart({
  data,
  isLoading = false,
}: TopViolationsChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between h-full animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-1.5">
              <div className="h-4 w-44 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-56 bg-slate-100 dark:bg-slate-800/70 rounded" />
            </div>
          </div>
          <div className="h-6 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-11 w-full bg-slate-100 dark:bg-slate-800/60 rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = data.length === 0;
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ListOrdered className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Top 10 Pelanggaran Terbanyak
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Peringkat jenis pelanggaran berdasarkan frekuensi kejadian
              </p>
            </div>
          </div>

          <Link
            href="/admin/rules"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-lg transition shrink-0"
          >
            <span>Katalog Aturan</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Content or Empty State */}
        {isEmpty ? (
          <div className="my-6 py-12 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
              <Inbox className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Belum Ada Data Pelanggaran
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mt-0.5">
              Daftar 10 pelanggaran paling sering terjadi akan tampil setelah laporan masuk.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {data.slice(0, 10).map((item, idx) => {
              const barWidth = Math.max(Math.round((item.count / maxCount) * 100), 6);
              const isBerat = item.categoryName === "Berat";
              const isSedang = item.categoryName === "Sedang";

              const barColor = isBerat
                ? "bg-gradient-to-r from-rose-500 to-red-600"
                : isSedang
                ? "bg-gradient-to-r from-amber-500 to-orange-500"
                : "bg-gradient-to-r from-blue-500 to-indigo-600";

              const badgeStyle = isBerat
                ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                : isSedang
                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800";

              return (
                <div
                  key={item.id || idx}
                  className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 ${
                          idx < 3
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {idx + 1}
                      </span>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                            {item.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badgeStyle}`}
                          >
                            {item.categoryName}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 mt-1 line-clamp-1">
                          {item.name}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        {item.count} Kasus
                      </div>
                      <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        {item.totalPoints} Poin ({item.percentage}%)
                      </div>
                    </div>
                  </div>

                  {/* Proportional Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-200/70 dark:bg-slate-700/70 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${barWidth}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>Menampilkan hingga 10 aturan paling sering dilanggar</span>
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {data.length} Jenis Tercatat
        </span>
      </div>
    </div>
  );
}
