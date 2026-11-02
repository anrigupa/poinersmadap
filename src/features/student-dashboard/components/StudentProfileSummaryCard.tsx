"use client";

import {
  GraduationCap,
  Mail,
  ShieldCheck,
  User,
  Phone,
  Sparkles,
  Award,
} from "lucide-react";
import {
  StudentProfileSummary,
  StudentPointsSummary,
} from "@/features/student-dashboard/types";

interface StudentProfileSummaryCardProps {
  profile: StudentProfileSummary;
  points: StudentPointsSummary;
}

export default function StudentProfileSummaryCard({
  profile,
  points,
}: StudentProfileSummaryCardProps) {
  const initials = profile.fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isAman = points.currentLevel === "Aman";
  const isSp1 = points.currentLevel === "SP1";
  const isSp2 = points.currentLevel === "SP2";

  const levelBadgeClass = isAman
    ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30"
    : isSp1
    ? "bg-amber-500/20 text-amber-200 border-amber-400/30"
    : isSp2
    ? "bg-orange-500/20 text-orange-200 border-orange-400/30"
    : "bg-rose-500/20 text-rose-200 border-rose-400/30";

  return (
    <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Avatar & Profile Details */}
        <div className="flex items-start sm:items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 text-white font-black text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25 border border-white/20">
            {initials}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/10 px-3 py-0.5 rounded-full text-blue-200 border border-white/10">
                Kartu Disiplin Siswa
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border font-bold ${levelBadgeClass}`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Status: {points.currentLevel}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {profile.fullName}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-300">
              <span className="font-mono">NISN: {profile.nisn}</span>
              <span>•</span>
              <span className="font-mono">NIS: {profile.nis}</span>
              <span>•</span>
              <span className="font-semibold text-blue-300">
                {profile.className} ({profile.major})
              </span>
              <span>•</span>
              <span>{profile.gender === "L" ? "Laki-laki" : "Perempuan"}</span>
            </div>

            {profile.parentName && (
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                <User className="w-3 h-3 text-slate-500" />
                <span>Wali: {profile.parentName}</span>
                {profile.parentPhone && (
                  <>
                    <span>•</span>
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{profile.parentPhone}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Key Point Scorecards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0">
          {/* Total Violation Points */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl text-center min-w-[120px] sm:min-w-[140px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block mb-0.5">
              Poin Pelanggaran
            </span>
            <div className="text-3xl sm:text-4xl font-black text-rose-400 tracking-tight">
              {points.totalViolationPoints}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {points.currentLevel}
            </span>
          </div>

          {/* Merit Points */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl text-center min-w-[120px] sm:min-w-[140px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block mb-0.5">
              Poin Prestasi
            </span>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
              +{points.totalMeritPoints}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Penghargaan
            </span>
          </div>
        </div>
      </div>

      {/* Decorative background glow */}
      <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
