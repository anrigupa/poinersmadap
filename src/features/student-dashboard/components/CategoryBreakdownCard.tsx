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
    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between h-full space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
            <Layers className="w-4 h-4" />
          </span>
          <h3 className="text-base font-semibold text-slate-800 tracking-tight">
            Komposisi Berdasarkan Kategori
          </h3>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Distribusi bobot pelanggaran tata tertib
        </p>
      </div>

      {/* Visual Multi-Segment Bar */}
      <div className="space-y-1.5">
        <div className="h-3.5 rounded-full overflow-hidden flex bg-slate-100 p-0.5 gap-0.5 border border-slate-200">
          {data.map((cat, idx) => (
            <div
              key={idx}
              style={{ width: `${cat.percentage || 1}%` }}
              className={`h-full rounded-sm transition-all duration-500 ${cat.color}`}
              title={`${cat.categoryName}: ${cat.points} Poin (${cat.percentage}%)`}
            />
          ))}
        </div>
        <div className="text-xs font-semibold text-slate-600 text-right">
          Total Beban: <span className="font-bold text-slate-900">{totalPoints} Poin</span>
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full shrink-0 ${item.color}`} />
              <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                {item.categoryName}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600">
                {item.count} Insiden
              </span>
              <span className="font-mono font-bold text-slate-900 min-w-[55px] text-right">
                {item.points} Poin
              </span>
              <span className="text-xs text-slate-500 font-medium min-w-[40px] text-right">
                ({item.percentage}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
