"use client";

import Link from "next/link";
import {
  BookOpen,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
} from "lucide-react";
import { StudentDashboardData } from "@/features/student-dashboard/types";
import StudentProfileSummaryCard from "@/features/student-dashboard/components/StudentProfileSummaryCard";
import ViolationLevelGauge from "@/features/student-dashboard/components/ViolationLevelGauge";
import ViolationTrendChart from "@/features/student-dashboard/components/ViolationTrendChart";
import CategoryBreakdownCard from "@/features/student-dashboard/components/CategoryBreakdownCard";
import StudentViolationHistoryList from "@/features/student-dashboard/components/StudentViolationHistoryList";

interface StudentDashboardClientProps {
  data: StudentDashboardData;
}

export default function StudentDashboardClient({
  data,
}: StudentDashboardClientProps) {
  const { profile, points, monthlyTrends, categoryBreakdown, history } = data;

  return (
    <div className="space-y-6">
      {/* 1. Profile Summary & Key Point Cards */}
      <StudentProfileSummaryCard profile={profile} points={points} />

      {/* 2. Status Level Gauge (0-35 Aman, 36-75 SP1, 76-150 SP2, 151+ SP3) */}
      <ViolationLevelGauge points={points} />

      {/* 3. Analytics Grid: Monthly Trend & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ViolationTrendChart data={monthlyTrends} />
        </div>
        <div>
          <CategoryBreakdownCard
            data={categoryBreakdown}
            totalPoints={points.totalViolationPoints}
          />
        </div>
      </div>

      {/* 4. Student Support & Quick Guide Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Buku Saku Tata Tertib Siswa
              </h4>
              <p className="text-[11px] text-slate-400">
                Pelajari pasal kedisiplinan dan sanksi resmi SMAN 2 PANGKEP
              </p>
            </div>
          </div>
          <Link
            href="/rules"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition shrink-0 flex items-center gap-1"
          >
            <span>Buka</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Program Pemutihan & Prestasi
              </h4>
              <p className="text-[11px] text-slate-400">
                Dapatkan poin penghargaan prestasi untuk mengurangi beban poin pelanggaran
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs shrink-0">
            +{points.totalMeritPoints} Poin
          </span>
        </div>
      </div>

      {/* 5. Incident History Timeline List */}
      <StudentViolationHistoryList items={history} />
    </div>
  );
}
