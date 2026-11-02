"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Layers, AlertCircle, Save } from "lucide-react";
import { categorySchema, CategoryFormData } from "@/features/rules/schemas";
import { ViolationCategory } from "@/features/rules/types";
import { createCategoryAction, updateCategoryAction } from "@/features/rules/actions";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: ViolationCategory | null;
  onSuccess: (message: string) => void;
}

const PRESET_COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#10b981", "#ec4899"];

export default function CategoryModal({
  isOpen,
  onClose,
  categoryToEdit,
  onSuccess,
}: CategoryModalProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      severityLevel: 1,
      description: "",
      colorCode: "#3b82f6",
    },
  });

  const selectedColor = watch("colorCode");

  useEffect(() => {
    if (categoryToEdit) {
      reset({
        name: categoryToEdit.name,
        severityLevel: categoryToEdit.severityLevel,
        description: categoryToEdit.description || "",
        colorCode: categoryToEdit.colorCode,
      });
    } else {
      reset({
        name: "",
        severityLevel: 1,
        description: "",
        colorCode: "#3b82f6",
      });
    }
  }, [categoryToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = (data: CategoryFormData) => {
    startTransition(async () => {
      let res;
      if (categoryToEdit) {
        res = await updateCategoryAction(categoryToEdit.id, data);
      } else {
        res = await createCategoryAction(data);
      }

      if (res.success) {
        onSuccess(res.message);
        onClose();
      } else {
        alert(res.message || "Gagal menyimpan kategori.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {categoryToEdit ? "Edit Kategori Pelanggaran" : "Tambah Kategori Baru"}
              </h3>
              <p className="text-[11px] text-slate-400">Pengelompokan bobot tata tertib sekolah</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Kategori <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="Contoh: Ringan, Sedang, Berat, Kedisiplinan Seragam"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                errors.name
                  ? "border-rose-300 focus:ring-rose-200"
                  : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
              }`}
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Severity Level Radio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tingkat Keparahan (Severity Level) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 1, label: "Level 1: Ringan", desc: "≤ 10 Poin" },
                { val: 2, label: "Level 2: Sedang", desc: "11 - 30 Poin" },
                { val: 3, label: "Level 3: Berat", desc: "> 30 Poin" },
              ].map((lvl) => (
                <label
                  key={lvl.val}
                  className={`p-2.5 rounded-xl border text-center cursor-pointer transition flex flex-col items-center ${
                    watch("severityLevel") === lvl.val
                      ? "border-blue-600 bg-blue-50/70 text-blue-900 font-bold"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    value={lvl.val}
                    {...register("severityLevel", { valueAsNumber: true })}
                    className="sr-only"
                  />
                  <span className="text-xs">{lvl.label}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">{lvl.desc}</span>
                </label>
              ))}
            </div>
            {errors.severityLevel && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.severityLevel.message}</p>
            )}
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Warna Penanda Label <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue("colorCode", c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    selectedColor === c ? "scale-125 ring-2 ring-offset-2 ring-slate-800" : "hover:scale-110"
                  }`}
                />
              ))}
              <input
                type="text"
                {...register("colorCode")}
                className="w-24 px-2 py-1 ml-2 text-xs font-mono rounded-lg border border-slate-200"
              />
            </div>
            {errors.colorCode && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.colorCode.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deskripsi Singkat (Opsional)
            </label>
            <textarea
              rows={2}
              {...register("description")}
              placeholder="Jelaskan kriteria pelanggaran dalam kategori ini..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20 disabled:opacity-60 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isPending ? "Menyimpan..." : "Simpan Kategori"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
