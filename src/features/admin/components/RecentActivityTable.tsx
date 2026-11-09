"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Inbox,
} from "lucide-react";
import { RecentViolationActivity } from "@/features/admin/types/overview";

interface RecentActivityTableProps {
  activities: RecentViolationActivity[];
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  isLoading?: boolean;
}

export default function RecentActivityTable({
  activities,
  selectedCategory,
  onSelectCategory,
  isLoading = false,
}: RecentActivityTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(
    selectedCategory || "all"
  );

  useEffect(() => {
    if (selectedCategory !== undefined) {
      setCategoryFilter(selectedCategory);
    }
  }, [selectedCategory]);

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    if (onSelectCategory) {
      onSelectCategory(value);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden p-5 animate-pulse space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-1.5">
              <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-64 bg-slate-100 dark:bg-slate-800/70 rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-40 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="h-8 w-32 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
        <div className="space-y-2.5 pt-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="h-12 w-full bg-slate-100 dark:bg-slate-800/60 rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  const filtered = activities.filter((act) => {
    const matchesSearch =
      act.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.studentNis.includes(searchTerm) ||
      act.violationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.className.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ||
      act.categoryName.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Aktivitas Pelanggaran Terkini
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Log real-time laporan insiden siswa dari Guru Piket &amp; Tim Tatib
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter Inputs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari siswa / kelas / aturan..."
              className="w-full sm:w-52 pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          >
            <option value="all">Semua Kategori</option>
            <option value="Ringan">Ringan</option>
            <option value="Sedang">Sedang</option>
            <option value="Berat">Berat</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
            <Inbox className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Belum ada aktivitas yang tercatat
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mt-0.5">
            {activities.length === 0
              ? "Belum ada data pelanggaran siswa yang dilaporkan."
              : "Tidak ada data aktivitas yang sesuai dengan filter pencarian."}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Stacked Card View (< md) */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((item) => {
              const isBerat = item.categoryName === "Berat";
              const isSedang = item.categoryName === "Sedang";

              const categoryBadge = isBerat
                ? "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                : isSedang
                ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                : "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800";

              return (
                <div key={item.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.studentName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        NIS: {item.studentNis} &bull; {item.className} &bull; {item.incidentDate}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] shrink-0 ${
                        isBerat
                          ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                          : isSedang
                          ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                          : "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                      }`}
                    >
                      +{item.points} Poin
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 dark:text-slate-200">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border mr-1.5 ${categoryBadge}`}
                    >
                      {item.categoryName}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 mr-1">
                      [{item.ruleCode}]
                    </span>
                    <span className="font-medium">{item.violationName}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span>Pelapor: {item.reportedByTeacher}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {item.status === "confirmed" ? "Terkonfirmasi" : "Proses Banding"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Waktu &amp; Siswa</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Jenis Pelanggaran</th>
                  <th className="py-3 px-4">Poin</th>
                  <th className="py-3 px-4">Pencatat (Guru)</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filtered.map((item) => {
                  const isBerat = item.categoryName === "Berat";
                  const isSedang = item.categoryName === "Sedang";

                  const categoryBadge = isBerat
                    ? "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                    : isSedang
                    ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                    : "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition group"
                    >
                      {/* Waktu & Siswa */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
                            {item.studentName
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white truncate">
                              {item.studentName}
                            </div>
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span>NIS: {item.studentNis}</span>
                              <span>&bull;</span>
                              <span>{item.incidentDate}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kelas */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                          {item.className}
                        </span>
                      </td>

                      {/* Jenis Pelanggaran */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${categoryBadge}`}
                          >
                            {item.categoryName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            [{item.ruleCode}]
                          </span>
                        </div>
                        <div className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                          {item.violationName}
                        </div>
                      </td>

                      {/* Poin */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            isBerat
                              ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                              : isSedang
                              ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                              : "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                          }`}
                        >
                          +{item.points} Poin
                        </span>
                      </td>

                      {/* Guru Pencatat */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                          {item.reportedByTeacher}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            item.status === "confirmed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                              : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                          }`}
                        >
                          {item.status === "confirmed" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Terkonfirmasi</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              <span>Proses Banding</span>
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Table Footer */}
      <div className="p-4 bg-slate-50/70 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          Menampilkan {filtered.length} dari {activities.length} aktivitas terbaru
        </span>
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition"
        >
          <span>Lihat Direktori Siswa &amp; Sanksi</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
