"use client";

import { useState } from "react";
import {
  User,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  FileCheck,
} from "lucide-react";
import { StudentCounselingProfile } from "@/features/counseling/types";

interface StudentProfileCardProps {
  profile: StudentCounselingProfile;
  onOpenCounselingModal: (studentId: string) => void;
}

export default function StudentProfileCard({
  profile,
  onOpenCounselingModal,
}: StudentProfileCardProps) {
  const [showViolations, setShowViolations] = useState(false);
  const { currentDisciplineStatus: disc } = profile;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            {profile.studentName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {profile.studentName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {profile.className}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              NIS: {profile.nis} • NISN: {profile.nisn}
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenCounselingModal(profile.id)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-md shadow-blue-600/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Bina / Potong Poin</span>
        </button>
      </div>

      {/* 3 Main Metrics Cards (Value -> Label -> Description) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. Total Points */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
              Disiplin
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                profile.totalPoints === 0
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                  : profile.totalPoints < 36
                  ? "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                  : "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              {profile.totalPoints}
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1.5">
              Akumulasi Poin
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {profile.totalPoints === 0 ? "Bersih dari poin sanksi" : "Poin pelanggaran aktif"}
            </p>
          </div>
        </div>

        {/* 2. Total Violations */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
              Riwayat
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              {profile.totalViolations}
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1.5">
              Total Pelanggaran
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Insiden tercatat di sistem
            </p>
          </div>
        </div>

        {/* 3. Current Discipline Status */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${disc.badgeClass}`}
            >
              {disc.level}
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {disc.level}
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1.5">
              Status Disiplin
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[200px]" title={disc.authority}>
              Wewenang: {disc.authority}
            </p>
          </div>
        </div>
      </div>

      {/* Disciplinary Action Required Guideline */}
      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-900 dark:text-amber-300">
              Rekomendasi Tindakan BK ({disc.level}):
            </span>
            <p className="text-amber-800/90 dark:text-amber-400/90 mt-0.5 leading-relaxed">
              {disc.actionRequired}
            </p>
          </div>
        </div>
      </div>

      {/* Collapsible Violations List */}
      {profile.recentViolations.length > 0 && (
        <div className="pt-2">
          <button
            onClick={() => setShowViolations(!showViolations)}
            className="flex items-center justify-between w-full py-2.5 px-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
          >
            <span>Lihat Riwayat Pelanggaran Siswa ({profile.recentViolations.length} catatan)</span>
            {showViolations ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showViolations && (
            <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
              {profile.recentViolations.map((v) => (
                <div key={v.id} className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {v.ruleCode}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {v.violationName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(v.incidentDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 shrink-0 border border-rose-200 dark:border-rose-800">
                    +{v.points} Poin
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
