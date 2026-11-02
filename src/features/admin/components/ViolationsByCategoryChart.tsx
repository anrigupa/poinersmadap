"use client";

import { PieChart, ShieldAlert, Award, AlertCircle } from "lucide-react";
import { CategoryViolationStat } from "@/features/admin/types/overview";

interface ViolationsByCategoryChartProps {
  data: CategoryViolationStat[];
}

export default function ViolationsByCategoryChart({ data }: ViolationsByCategoryChartProps) {
  const totalIncidents = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Komposisi per Kategori</h3>
              <p className="text-[11px] text-slate-400">Tingkat keparahan tata tertib</p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            {totalIncidents} Total
          </span>
        </div>

        {/* Stacked Multi-Segment Progress Bar */}
        <div className="mt-5">
          <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            {data.map((cat, idx) => (
              <div
                key={idx}
                style={{
                  width: `${cat.percentage}%`,
                  backgroundColor: cat.colorCode,
                }}
                className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full hover:brightness-110"
                title={`${cat.categoryName}: ${cat.percentage}% (${cat.count} kasus)`}
              />
            ))}
          </div>

          {/* Quick Category Legend */}
          <div className="flex items-center justify-between mt-2.5 text-[11px] font-medium text-slate-500">
            {data.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.colorCode }} />
                <span>
                  {cat.categoryName} ({cat.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="mt-6 space-y-2.5">
        {data.map((cat, idx) => {
          const isRingan = cat.categoryName === "Ringan";
          const isSedang = cat.categoryName === "Sedang";
          const isBerat = cat.categoryName === "Berat";

          const bgClass = isRingan
            ? "bg-blue-50/70 border-blue-100"
            : isSedang
            ? "bg-amber-50/70 border-amber-100"
            : "bg-rose-50/70 border-rose-100";

          const badgeClass = isRingan
            ? "bg-blue-100 text-blue-700"
            : isSedang
            ? "bg-amber-100 text-amber-700"
            : "bg-rose-100 text-rose-700";

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all hover:bg-white hover:shadow-xs ${bgClass}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs text-white"
                  style={{ backgroundColor: cat.colorCode }}
                >
                  {cat.categoryName[0]}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>Pelanggaran {cat.categoryName}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${badgeClass}`}>
                      {cat.count} Kasus
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Total Bobot Sanksi: {cat.points} Poin
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-black text-slate-800">{cat.percentage}%</div>
                <div className="text-[10px] text-slate-400">dari total</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400">
        <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Pelanggaran Berat langsung memicu rapat komite & pemanggilan orang tua (SP2/SP3).</span>
      </div>
    </div>
  );
}
