"use client";

import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Award,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { StudentPointsSummary } from "@/features/student-dashboard/types";

interface ViolationLevelGaugeProps {
  points: StudentPointsSummary;
}

export default function ViolationLevelGauge({ points }: ViolationLevelGaugeProps) {
  const currentPts = points.totalViolationPoints;

  // Exact specification thresholds:
  // 0-35 = Aman
  // 36-75 = SP1
  // 76-150 = SP2
  // 151+ = SP3 (Kepala Sekolah)

  const isAman = currentPts <= 35;
  const isSp1 = currentPts >= 36 && currentPts <= 75;
  const isSp2 = currentPts >= 76 && currentPts <= 150;
  const isSp3 = currentPts >= 151;

  // Calculate percentage along the complete 0 - 151+ scale (capped at 160 for visual width)
  const maxScale = 160;
  const pinPositionPercent = Math.min(
    Math.max(Math.round((currentPts / maxScale) * 100), 2),
    98
  );

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Tingkat Status Kedisiplinan & Batas Sanksi
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Indikator tingkat penindakan kedisiplinan resmi SMA Negeri 2 Playen
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Status Saat Ini:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
              isAman
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : isSp1
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : isSp2
                ? "bg-orange-50 text-orange-700 border-orange-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {points.currentLevel}
          </span>
        </div>
      </div>

      {/* Modern Multi-Tiered Level Gauge Bar */}
      <div className="space-y-2 pt-4">
        {/* Needle Marker Indicator */}
        <div className="relative h-6">
          <div
            className="absolute -top-1 -translate-x-1/2 flex flex-col items-center transition-all duration-500"
            style={{ left: `${pinPositionPercent}%` }}
          >
            <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono text-[10px] font-bold shadow-md whitespace-nowrap">
              {currentPts} Poin (Anda)
            </span>
            <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
          </div>
        </div>

        {/* 4-Zone Segmented Track Bar */}
        <div className="h-5 rounded-full overflow-hidden flex p-1 bg-slate-100 gap-1 border border-slate-200/80">
          {/* Zone 1: 0 - 35 = Aman (Width ~ 22%) */}
          <div
            className={`h-full rounded-l-full transition-all flex items-center justify-center text-[10px] font-bold text-white ${
              isAman ? "bg-emerald-500 shadow-xs" : "bg-emerald-400/70"
            }`}
            style={{ width: "22%" }}
            title="0 - 35 Poin: Aman"
          >
            Aman
          </div>

          {/* Zone 2: 36 - 75 = SP1 (Width ~ 25%) */}
          <div
            className={`h-full transition-all flex items-center justify-center text-[10px] font-bold text-white ${
              isSp1 ? "bg-amber-500 shadow-xs" : "bg-amber-400/70"
            }`}
            style={{ width: "25%" }}
            title="36 - 75 Poin: SP 1"
          >
            SP 1
          </div>

          {/* Zone 3: 76 - 150 = SP2 (Width ~ 38%) */}
          <div
            className={`h-full transition-all flex items-center justify-center text-[10px] font-bold text-white ${
              isSp2 ? "bg-orange-500 shadow-xs" : "bg-orange-400/70"
            }`}
            style={{ width: "38%" }}
            title="76 - 150 Poin: SP 2"
          >
            SP 2
          </div>

          {/* Zone 4: 151+ = SP3 (Width ~ 15%) */}
          <div
            className={`h-full rounded-r-full transition-all flex items-center justify-center text-[10px] font-bold text-white ${
              isSp3 ? "bg-rose-600 shadow-xs" : "bg-rose-500/70"
            }`}
            style={{ width: "15%" }}
            title="151+ Poin: SP 3 (Kepala Sekolah)"
          >
            SP 3
          </div>
        </div>

        {/* Scale Numbers Reference Labels */}
        <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-1 px-1">
          <span>0 Poin</span>
          <span className="text-emerald-600 font-semibold">35</span>
          <span className="text-amber-600 font-semibold">75</span>
          <span className="text-orange-600 font-semibold">150</span>
          <span className="text-rose-600 font-bold">151+</span>
        </div>
      </div>

      {/* Status Details & Threshold Advice Card */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
        {/* Tier 1: Aman */}
        <div
          className={`p-3.5 rounded-2xl border transition ${
            isAman
              ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/20"
              : "bg-slate-50/60 border-slate-200/80 opacity-70"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-emerald-800">Aman</span>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
              0 - 35
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Kondisi tertib wajar. Tanggung jawab pembinaan:{" "}
            <strong>Wali Kelas</strong>.
          </p>
        </div>

        {/* Tier 2: SP1 */}
        <div
          className={`p-3.5 rounded-2xl border transition ${
            isSp1
              ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20"
              : "bg-slate-50/60 border-slate-200/80 opacity-70"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-amber-800">SP 1</span>
            <span className="text-[10px] font-mono text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
              36 - 75
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Peringatan tertulis 1. Bimbingan bersama{" "}
            <strong>Wali Kelas & Guru BK</strong>.
          </p>
        </div>

        {/* Tier 3: SP2 */}
        <div
          className={`p-3.5 rounded-2xl border transition ${
            isSp2
              ? "bg-orange-50/80 border-orange-300 ring-2 ring-orange-400/20"
              : "bg-slate-50/60 border-slate-200/80 opacity-70"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-orange-800">SP 2</span>
            <span className="text-[10px] font-mono text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">
              76 - 150
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Peringatan tertulis 2. Pemanggilan Orang Tua oleh{" "}
            <strong>Guru BK & Kesiswaan</strong>.
          </p>
        </div>

        {/* Tier 4: SP3 */}
        <div
          className={`p-3.5 rounded-2xl border transition ${
            isSp3
              ? "bg-rose-50/80 border-rose-300 ring-2 ring-rose-400/20"
              : "bg-slate-50/60 border-slate-200/80 opacity-70"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-rose-800">SP 3</span>
            <span className="text-[10px] font-mono text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
              151+
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Sidang sanksi berat / skorsing oleh{" "}
            <strong>Kepala Sekolah</strong>.
          </p>
        </div>
      </div>

      {/* Remaining Points Guidance Alert */}
      <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          {isAman ? (
            <span>
              Anda memiliki toleransi selisih{" "}
              <strong className="font-bold text-blue-700">
                {points.pointsToNextLevel} poin
              </strong>{" "}
              lagi sebelum mencapai ambang batas Surat Peringatan Pertama (SP1: 36 Poin).
            </span>
          ) : isSp1 ? (
            <span>
              Anda berjarak{" "}
              <strong className="font-bold text-amber-700">
                {points.pointsToNextLevel} poin
              </strong>{" "}
              dari batas Surat Peringatan Kedua (SP2: 76 Poin). Ikuti program pembinaan sekolah untuk pemutihan poin.
            </span>
          ) : isSp2 ? (
            <span>
              Peringatan kritis: Anda hanya berjarak{" "}
              <strong className="font-bold text-rose-700">
                {points.pointsToNextLevel} poin
              </strong>{" "}
              dari batas SP3 Kepala Sekolah (151 Poin). Segera temui Guru BK.
            </span>
          ) : (
            <span>
              Status kedisiplinan Anda telah melampaui batas toleransi 151 poin. Wajib menghadap Kepala Sekolah bersama orang tua murid.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
