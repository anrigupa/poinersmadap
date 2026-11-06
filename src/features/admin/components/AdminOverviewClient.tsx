"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { RefreshCw, Moon, Sun, Radio } from "lucide-react";
import MetricsWidgetGrid from "@/features/admin/components/MetricsWidgetGrid";
import ViolationsByMonthChart from "@/features/admin/components/ViolationsByMonthChart";
import ViolationsByCategoryChart from "@/features/admin/components/ViolationsByCategoryChart";
import TopViolationsChart from "@/features/admin/components/TopViolationsChart";
import TopStudentsByPointsChart from "@/features/admin/components/TopStudentsByPointsChart";
import RecentActivityTable from "@/features/admin/components/RecentActivityTable";
import { getAdminOverviewData } from "@/features/admin/actions/overviewActions";
import { createClient } from "@/lib/supabase/client";
import { AdminOverviewData } from "@/features/admin/types/overview";

interface AdminOverviewClientProps {
  initialData: AdminOverviewData;
  adminName: string;
}

export default function AdminOverviewClient({
  initialData,
  adminName,
}: AdminOverviewClientProps) {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<AdminOverviewData>(initialData);
  const [selectedSemester, setSelectedSemester] = useState<"ganjil" | "genap">(
    "ganjil"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);

  // Sync dark mode class with document root
  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const root = document.documentElement;
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const fetchFreshData = useCallback(
    (semesterToLoad: "ganjil" | "genap") => {
      startTransition(async () => {
        const fresh = await getAdminOverviewData({ semester: semesterToLoad });
        setData(fresh);
      });
    },
    []
  );

  // Subscribe to real-time Supabase changes on student_violations and students
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl === "https://placeholder-project.supabase.co") {
      return;
    }

    const supabase = createClient();
    const channel = supabase
      .channel("admin-discipline-analytics")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "student_violations" },
        () => {
          fetchFreshData(selectedSemester);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students" },
        () => {
          fetchFreshData(selectedSemester);
        }
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFreshData, selectedSemester]);

  const handleSemesterChange = (newSemester: "ganjil" | "genap") => {
    setSelectedSemester(newSemester);
    fetchFreshData(newSemester);
  };

  const handleRefresh = () => {
    fetchFreshData(selectedSemester);
  };

  return (
    <div className="space-y-8">
      {/* Overview Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              SMADAP POINER &bull; Overview Eksekutif
            </span>
            <span className="text-slate-400 text-xs">&bull;</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              T.A. {data.academicPeriod.year} ({data.academicPeriod.semester})
            </span>
            {isRealtimeConnected && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <Radio className="w-3 h-3 animate-pulse" />
                Realtime Aktif
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Dashboard Ketertiban &amp; Disiplin Siswa
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Selamat bertugas, <span className="font-semibold text-slate-700 dark:text-slate-200">{adminName}</span> &mdash; Pantau tren pelanggaran, kategori, dan siswa prioritas pembinaan secara real-time.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedSemester}
            onChange={(e) =>
              handleSemesterChange(e.target.value as "ganjil" | "genap")
            }
            disabled={isPending}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition disabled:opacity-50"
          >
            <option value="ganjil">Semester Ganjil (Jul - Des)</option>
            <option value="genap">Semester Genap (Jan - Jun)</option>
          </select>

          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title={isDarkMode ? "Mode Terang" : "Mode Gelap"}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isPending}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer disabled:opacity-50"
            title="Muat Ulang Metrik Realtime"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                isPending ? "animate-spin text-blue-600 dark:text-blue-400" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* 1. Primary Metrics Cards: Total Violations, Total Violation Points, Students With Violations, Monthly Change % */}
      <MetricsWidgetGrid
        metrics={data.metrics}
        dataSource={data.dataSource}
        isLoading={isPending}
      />

      {/* 2. Charts Row 1: Monthly Trend & Violation Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ViolationsByMonthChart
            data={data.monthlyStats}
            academicYear={data.academicPeriod.year}
            semester={data.academicPeriod.semester}
            isLoading={isPending}
          />
        </div>
        <div className="lg:col-span-5">
          <ViolationsByCategoryChart
            data={data.categoryStats}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            isLoading={isPending}
          />
        </div>
      </div>

      {/* 3. Charts Row 2: Top 10 Violations & Top 10 Students by Points */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <TopViolationsChart
            data={data.topViolations}
            isLoading={isPending}
          />
        </div>
        <div className="lg:col-span-6">
          <TopStudentsByPointsChart
            data={data.topStudents}
            isLoading={isPending}
          />
        </div>
      </div>

      {/* 4. Recent Activity Table */}
      <RecentActivityTable
        activities={data.recentActivities}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        isLoading={isPending}
      />
    </div>
  );
}
