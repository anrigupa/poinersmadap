"use client";

import { useState } from "react";
import { Search, AlertTriangle, Check, BookOpen, X } from "lucide-react";
import { ViolationItem } from "@/features/rules/types";

interface ViolationRuleSelectorProps {
  rules: ViolationItem[];
  selectedRule: ViolationItem | null;
  onSelect: (rule: ViolationItem) => void;
}

export default function ViolationRuleSelector({
  rules,
  selectedRule,
  onSelect,
}: ViolationRuleSelectorProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "Ringan", "Sedang", "Berat"];

  const filtered = rules.filter((r) => {
    if (selectedCategory !== "all" && r.categoryName !== selectedCategory) {
      return false;
    }
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari pasal, nama pelanggaran, atau kode aturan (e.g. K-01)..."
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

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat === "all" ? "Semua Kategori" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Grid */}
      <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100 bg-white">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <span>Tidak ditemukan aturan tata tertib yang cocok</span>
          </div>
        ) : (
          filtered.map((rule) => {
            const isSelected = selectedRule?.id === rule.id;
            const isHeavy = rule.categoryName === "Berat";
            const isMedium = rule.categoryName === "Sedang";

            const catBadge = isHeavy
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : isMedium
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200";

            return (
              <div
                key={rule.id}
                onClick={() => onSelect(rule)}
                className={`p-4 flex items-start justify-between gap-4 cursor-pointer transition ${
                  isSelected
                    ? "bg-blue-50/80 hover:bg-blue-100/60"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {rule.code}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catBadge}`}
                    >
                      {rule.categoryName}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {rule.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {rule.description}
                  </p>
                  {rule.sanctionRecommendation && (
                    <div className="text-[10px] text-slate-400 italic pt-0.5">
                      Rekomendasi Sanksi: {rule.sanctionRecommendation}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    +{rule.points} Poin
                  </span>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition mt-1 ${
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
