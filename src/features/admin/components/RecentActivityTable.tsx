"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { RecentViolationActivity } from "@/features/admin/types/overview";

interface RecentActivityTableProps {
  activities: RecentViolationActivity[];
}

export default function RecentActivityTable({ activities }: RecentActivityTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = activities.filter((act) => {
    const matchesSearch =
      act.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.studentNis.includes(searchTerm) ||
      act.violationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.className.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || act.categoryName.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Aktivitas Pelanggaran Terkini
              </h3>
              <p className="text-[11px] text-slate-400">
                Log real-time laporan insiden siswa dari Guru Piket & Tim Tatib
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter Inputs */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari siswa / kelas..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          >
            <option value="all">Semua Kategori</option>
            <option value="Ringan">Ringan</option>
            <option value="Sedang">Sedang</option>
            <option value="Berat">Berat</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 sm:px-6">Waktu & Siswa</th>
              <th className="py-3 px-4">Kelas</th>
              <th className="py-3 px-4">Jenis Pelanggaran</th>
              <th className="py-3 px-4">Poin</th>
              <th className="py-3 px-4">Pencatat (Guru)</th>
              <th className="py-3 px-4 sm:px-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.length > 0 ? (
              filtered.map((item) => {
                const isBerat = item.categoryName === "Berat";
                const isSedang = item.categoryName === "Sedang";

                const categoryBadge = isBerat
                  ? "bg-rose-100 text-rose-800 border-rose-200"
                  : isSedang
                  ? "bg-amber-100 text-amber-800 border-amber-200"
                  : "bg-blue-100 text-blue-800 border-blue-200";

                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition group">
                    {/* Waktu & Siswa */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {item.studentName
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{item.studentName}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>NIS: {item.studentNis}</span>
                            <span>&bull;</span>
                            <span>{item.incidentDate}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Kelas */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        {item.className}
                      </span>
                    </td>

                    {/* Jenis Pelanggaran */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md border ${categoryBadge}`}>
                          {item.categoryName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">[{item.ruleCode}]</span>
                      </div>
                      <div className="font-medium text-slate-800 line-clamp-1">{item.violationName}</div>
                    </td>

                    {/* Poin */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          isBerat
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : isSedang
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        +{item.points} Poin
                      </span>
                    </td>

                    {/* Guru Pencatat */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-700 font-medium text-[11px]">{item.reportedByTeacher}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          item.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {item.status === "confirmed" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Terkonfirmasi</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>Proses Banding</span>
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                  Tidak ada data aktivitas yang sesuai dengan filter pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">
          Menampilkan {filtered.length} dari {activities.length} aktivitas terbaru
        </span>
        <Link
          href="/admin/sanctions"
          className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-700 transition"
        >
          <span>Kelola Tindak Lanjut Sanksi</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
