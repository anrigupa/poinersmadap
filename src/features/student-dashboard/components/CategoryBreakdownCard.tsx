"use client";

import { PieChart, ShieldAlert, Award, Layers } from "lucide-react";
import { CategoryBreakdownItem } from "@/features/student-dashboard/types";

interface CategoryBreakdownCardProps {
  data: CategoryBreakdownItem[];
  totalPoints: number;
}

export default function CategoryBreakdownCard({
  data,
  totalPoints,
}: CategoryBreakdownCardProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
            <Layers className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Komposisi Berdasarkan Kategori
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Distribusi bobot pelanggaran tata tertib
        </p>
      </div>

      {/* Visual Multi-Segment Bar */}
      <div className="space-y-1.5">
        <div className="h-3.5 rounded-full overflow-hidden flex bg-slate-100 p-0.5 gap-0.5 border border-slate-200/80">
          {data.map((cat, idx) => (
            <div
              key={idx}
              style={{ width: `${cat.percentage || 1}%` }}
              className={`h-full rounded-sm transition-all duration-500 ${cat.color}`}
              title={`${cat.categoryName}: ${cat.points} Poin (${cat.percentage}%)`}
            />
          ))}
        </div>
        <div className="text-[10px] text-slate-400 text-right">
          Total Beban: {totalPoints} Poin
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full shrink-0 ${item.color}`} />
              <span className="font-semibold text-slate-800">
                {item.categoryName}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400">
                {item.count} Insiden
              </span>
              <span className="font-mono font-bold text-slate-800 min-w-[55px] text-right">
                {item.points} Poin
              </span>
              <span className="text-[10px] text-slate-400 min-w-[35px] text-right">
                ({item.percentage}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
