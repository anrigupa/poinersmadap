"use client";

import { useState } from "react";
import {
  Search,
  Check,
  GraduationCap,
  AlertTriangle,
  UserCheck,
  X,
  Filter,
} from "lucide-react";
import { StudentItem } from "@/features/students/types";

interface SearchableStudentSelectorProps {
  students: StudentItem[];
  selectedStudent: StudentItem | null;
  onSelect: (student: StudentItem) => void;
}

export default function SearchableStudentSelector({
  students,
  selectedStudent,
  onSelect,
}: SearchableStudentSelectorProps) {
  const [query, setQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

  const classes = Array.from(new Set(students.map((s) => s.className))).sort();

  const filtered = students.filter((s) => {
    const matchesClass =
      selectedClass === "all" || s.className === selectedClass;
    if (!matchesClass) return false;

    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.nis.includes(q) ||
      s.nisn.includes(q) ||
      s.className.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Selected Student Banner (if chosen) */}
      {selectedStudent && (
        <div className="p-4 bg-blue-50/70 border-2 border-blue-500 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              {selectedStudent.fullName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  {selectedStudent.fullName}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Terpilih
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                <span className="font-mono">NIS: {selectedStudent.nis}</span>
                <span>•</span>
                <span className="font-semibold text-slate-700">
                  {selectedStudent.className}
                </span>
                <span>•</span>
                <span>Jurusan {selectedStudent.major}</span>
                <span>•</span>
                <span className="font-bold text-amber-700">
                  Poin Saat Ini: {selectedStudent.totalViolationPoints}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              // Deselect
              setQuery("");
            }}
            className="text-xs text-blue-700 hover:text-blue-900 font-semibold underline sm:text-right shrink-0"
          >
            Pilih Siswa Lain
          </button>
        </div>
      )}

      {/* Search & Class Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari berdasarkan nama, NIS (contoh: 10293), NISN, atau kelas..."
            className="w-full pl-10 pr-9 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden transition bg-white shadow-2xs"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-blue-500 focus:outline-hidden transition shadow-2xs"
          >
            <option value="all">Semua Rombel Kelas</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student List Grid */}
      <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100 bg-white">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            <GraduationCap className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <span>Tidak ditemukan siswa dengan kata kunci &quot;{query}&quot;</span>
          </div>
        ) : (
          filtered.map((student) => {
            const isSelected = selectedStudent?.id === student.id;
            const points = student.totalViolationPoints;
            const pointsBadge =
              points >= 75
                ? "bg-rose-50 text-rose-700 border-rose-200 font-bold"
                : points >= 30
                ? "bg-amber-50 text-amber-700 border-amber-200 font-semibold"
                : "bg-emerald-50 text-emerald-700 border-emerald-200";

            return (
              <div
                key={student.id}
                onClick={() => onSelect(student)}
                className={`p-3.5 flex items-center justify-between cursor-pointer transition ${
                  isSelected
                    ? "bg-blue-50/80 hover:bg-blue-100/60"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {student.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {student.fullName}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-medium">
                        NIS: {student.nis}
                      </span>
                      <span>•</span>
                      <span className="text-slate-600 font-medium">
                        {student.className}
                      </span>
                      <span>•</span>
                      <span>{student.gender === "L" ? "Laki-laki" : "Perempuan"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${pointsBadge}`}
                    >
                      {points} Poin
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase mt-0.5">
                      {student.status}
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition ${
                      isSelected
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-slate-300 text-transparent"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
