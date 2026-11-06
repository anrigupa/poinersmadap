"use client";

import Link from "next/link";
import { ShieldAlert, ArrowUpRight, Inbox } from "lucide-react";
import { TopStudentStat } from "@/features/admin/types/overview";
import { getDisciplinaryLevel } from "@/lib/constants/discipline";

interface TopStudentsByPointsChartProps {
  data: TopStudentStat[];
  isLoading?: boolean;
}

export default function TopStudentsByPointsChart({
  data,
  isLoading = false,
}: TopStudentsByPointsChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between h-full animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-1.5">
              <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-56 bg-slate-100 dark:bg-slate-800/70 rounded" />
            </div>
          </div>
          <div className="h-6 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-12 w-full bg-slate-100 dark:bg-slate-800/60 rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  const studentsWithPoints = data.filter((s) => s.totalViolationPoints > 0);
  const displayList = studentsWithPoints.length > 0 ? studentsWithPoints : data;
  const isEmpty = displayList.length === 0 || displayList.every((s) => s.totalViolationPoints === 0);
  const maxPoints = Math.max(...displayList.map((s) => s.totalViolationPoints), 150);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Top 10 Siswa berdasarkan Poin
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Prioritas pemantauan BK &amp; eskalasi sanksi (SP1 / SP2 / SP3)
              </p>
            </div>
          </div>

          <Link
            href="/admin/students"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-lg transition shrink-0"
          >
            <span>Data Siswa</span>
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
              Seluruh Siswa Berstatus Aman (0 Poin)
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mt-0.5">
              Belum ada siswa yang memiliki akumulasi poin pelanggaran pada periode ini.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {displayList.slice(0, 10).map((student, idx) => {
              const levelConfig = getDisciplinaryLevel(student.totalViolationPoints);
              const barPercent = Math.min(
                Math.max(Math.round((student.totalViolationPoints / maxPoints) * 100), 6),
                100
              );

              const barColor =
                levelConfig.badgeColor === "rose"
                  ? "bg-gradient-to-r from-rose-500 to-red-600"
                  : levelConfig.badgeColor === "orange"
                  ? "bg-gradient-to-r from-orange-500 to-red-500"
                  : levelConfig.badgeColor === "amber"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500";

              const statusBadgeStyle =
                levelConfig.badgeColor === "rose"
                  ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                  : levelConfig.badgeColor === "orange"
                  ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800"
                  : levelConfig.badgeColor === "amber"
                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";

              return (
                <div
                  key={student.id || idx}
                  className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 ${
                          idx === 0
                            ? "bg-rose-600 text-white"
                            : idx < 3
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {idx + 1}
                      </span>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {student.fullName}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${statusBadgeStyle}`}
                          >
                            {levelConfig.level}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono">NIS: {student.nis}</span>
                          <span>&bull;</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {student.className}
                          </span>
                          <span>&bull;</span>
                          <span>{student.violationCount}x Pelanggaran</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-rose-600 dark:text-rose-400">
                        {student.totalViolationPoints} Poin
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        Ambang SP3: 151
                      </div>
                    </div>
                  </div>

                  {/* Point Threshold Bar */}
                  <div className="w-full h-1.5 bg-slate-200/70 dark:bg-slate-700/70 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${barPercent}%` }}
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
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <span>Ambang Sanksi: SP1 (36) &bull; SP2 (76) &bull; SP3 (151+)</span>
        <span className="font-semibold text-rose-600 dark:text-rose-400">
          {displayList.filter((s) => s.totalViolationPoints >= 36).length} Siswa Wajib Pembinaan
        </span>
      </div>
    </div>
  );
}
