"use client";

import { Plus, Edit2, Trash2, Layers } from "lucide-react";
import { ViolationCategory } from "@/features/rules/types";

interface CategoryManagementBarProps {
  categories: ViolationCategory[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (category: ViolationCategory) => void;
  onRequestDeleteCategory: (category: ViolationCategory) => void;
}

export default function CategoryManagementBar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onOpenCreateModal,
  onOpenEditModal,
  onRequestDeleteCategory,
}: CategoryManagementBarProps) {
  const activeCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            Filter Kategori Aturan:
          </span>
        </div>

        {/* Action Controls for Category */}
        <div className="flex items-center gap-2">
          {activeCategory && (
            <>
              <button
                type="button"
                onClick={() => onOpenEditModal(activeCategory)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition inline-flex items-center gap-1.5 cursor-pointer"
                title={`Edit Kategori ${activeCategory.name}`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Kategori</span>
              </button>

              <button
                type="button"
                onClick={() => onRequestDeleteCategory(activeCategory)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition inline-flex items-center gap-1.5 cursor-pointer"
                title={`Hapus Kategori ${activeCategory.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 transition inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Kategori Baru</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onSelectCategory("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
            selectedCategoryId === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          Semua Kategori
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer border ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: isSelected ? "#ffffff" : cat.colorCode }}
              />
              <span>Kategori {cat.name}</span>
              {cat.itemCount !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {cat.itemCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
