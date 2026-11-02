"use client";

import { AlertTriangle, ShieldCheck, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import { StudentItem } from "@/features/students/types";
import { ViolationItem } from "@/features/rules/types";

interface PointImpactSummaryProps {
  student: StudentItem | null;
  rule: ViolationItem | null;
}

export default function PointImpactSummary({
  student,
  rule,
}: PointImpactSummaryProps) {
  if (!student || !rule) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-400 text-center">
        Pilih siswa dan aturan pelanggaran untuk melihat kalkulasi proyeksi poin disiplin.
      </div>
    );
  }

  const previousPoints = student.totalViolationPoints;
  const addedPoints = rule.points;
  const newTotalPoints = previousPoints + addedPoints;

  // Status computation
  const getStatus = (pts: number) => {
    if (pts >= 100) return { label: "SP 3 / Skorsing", badge: "bg-red-600 text-white", level: 3 };
    if (pts >= 75) return { label: "SP 2 (Panggilan Ortu 2)", badge: "bg-orange-500 text-white", level: 2 };
    if (pts >= 30) return { label: "SP 1 (Peringatan Tertulis)", badge: "bg-amber-500 text-white", level: 1 };
    return { label: "Aktif (Aman)", badge: "bg-emerald-600 text-white", level: 0 };
  };

  const prevStatus = getStatus(previousPoints);
  const nextStatus = getStatus(newTotalPoints);
  const isEscalated = nextStatus.level > prevStatus.level;

  return (
    <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-600" />
          Kalkulasi Poin & Proyeksi Status Disiplin
        </h4>
        <span className="text-[11px] font-mono text-slate-400">
          NIS: {student.nis} ({student.className})
        </span>
      </div>

      {/* Point Calculation Row */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[11px] text-slate-500 font-medium block mb-1">
            Poin Saat Ini
          </span>
          <span className="text-xl font-bold text-slate-800">
            {previousPoints}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {prevStatus.label}
          </span>
        </div>

        <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
          <span className="text-[11px] text-rose-700 font-semibold block mb-1">
            Tambahan Poin
          </span>
          <span className="text-xl font-extrabold text-rose-600">
            +{addedPoints}
          </span>
          <span className="text-[10px] text-rose-500 font-medium block mt-0.5">
            {rule.code} ({rule.categoryName})
          </span>
        </div>

        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
          <span className="text-[11px] text-blue-700 font-semibold block mb-1">
            Total Poin Baru
          </span>
          <span className="text-xl font-extrabold text-blue-700">
            {newTotalPoints}
          </span>
          <span className="text-[10px] text-blue-600 font-bold block mt-0.5">
            {nextStatus.label}
          </span>
        </div>
      </div>

      {/* Threshold Escalation Warning */}
      {isEscalated ? (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Eskalasi Sanksi Disiplin!</span>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Dengan tambahan +{addedPoints} poin ini, akumulasi pelanggaran siswa mencapai{" "}
              <strong>{newTotalPoints} poin</strong>, sehingga status siswa otomatis meningkat menjadi{" "}
              <strong className="underline">{nextStatus.label}</strong>. Rekomendasikan penanganan ke Guru BK atau Wali Kelas.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Status kedisiplinan siswa tetap berada pada kategori <strong>{nextStatus.label}</strong>.
          </span>
        </div>
      )}
    </div>
  );
}
