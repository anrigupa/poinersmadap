"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, ShieldAlert, Save, Sparkles, Hash } from "lucide-react";
import { violationSchema, ViolationFormData } from "@/features/rules/schemas";
import { ViolationCategory, ViolationItem } from "@/features/rules/types";
import { createViolationAction, updateViolationAction } from "@/features/rules/actions";

interface ViolationModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ViolationCategory[];
  violationToEdit?: ViolationItem | null;
  onSuccess: (message: string) => void;
}

const POINT_PRESETS = [5, 10, 15, 20, 25, 50, 75, 100];

export default function ViolationModal({
  isOpen,
  onClose,
  categories,
  violationToEdit,
  onSuccess,
}: ViolationModalProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ViolationFormData>({
    resolver: zodResolver(violationSchema),
    defaultValues: {
      categoryId: categories[0]?.id || "",
      name: "",
      description: "",
      points: 5,
      code: "",
      sanctionRecommendation: "",
    },
  });

  const currentPoints = watch("points");

  useEffect(() => {
    if (violationToEdit) {
      reset({
        categoryId: violationToEdit.categoryId,
        name: violationToEdit.name,
        description: violationToEdit.description,
        points: violationToEdit.points,
        code: violationToEdit.code,
        sanctionRecommendation: violationToEdit.sanctionRecommendation || "",
      });
    } else {
      reset({
        categoryId: categories[0]?.id || "",
        name: "",
        description: "",
        points: 5,
        code: "",
        sanctionRecommendation: "",
      });
    }
  }, [violationToEdit, reset, isOpen, categories]);

  if (!isOpen) return null;

  const onSubmit = (data: ViolationFormData) => {
    startTransition(async () => {
      let res;
      if (violationToEdit) {
        res = await updateViolationAction(violationToEdit.id, data);
      } else {
        res = await createViolationAction(data);
      }

      if (res.success) {
        onSuccess(res.message);
        onClose();
      } else {
        alert(res.message || "Gagal menyimpan aturan pelanggaran.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {violationToEdit ? "Edit Aturan Pelanggaran" : "Tambah Aturan Pelanggaran Baru"}
              </h3>
              <p className="text-[11px] text-slate-400">Parameter tata tertib, bobot sanksi, dan pasal</p>
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

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kategori Pelanggaran <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("categoryId")}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none focus:ring-2 transition ${
                errors.categoryId
                  ? "border-rose-300 focus:ring-rose-200"
                  : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
              }`}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  Kategori {c.name} (Severity Level {c.severityLevel})
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Pelanggaran <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register("name")}
                placeholder="Contoh: Terlambat Masuk Sekolah"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                  errors.name
                    ? "border-rose-300 focus:ring-rose-200"
                    : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
                }`}
              />
              {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name.message}</p>}
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Pasal</label>
              <input
                type="text"
                {...register("code")}
                placeholder="K-01"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono uppercase text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deskripsi & Bunyi Tata Tertib <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              {...register("description")}
              placeholder="Rincikan tindakan yang melanggar aturan dan kriteria pembuktian..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                errors.description
                  ? "border-rose-300 focus:ring-rose-200"
                  : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
              }`}
            />
            {errors.description && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Points Penalty with Presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Bobot Poin Pelanggaran <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                +{currentPoints} Poin Sanksi
              </span>
            </div>

            <input
              type="number"
              {...register("points", { valueAsNumber: true })}
              min={1}
              max={100}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none focus:ring-2 transition ${
                errors.points
                  ? "border-rose-300 focus:ring-rose-200"
                  : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
              }`}
            />

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400 font-semibold mr-1">Preset:</span>
              {POINT_PRESETS.map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => setValue("points", pt)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                    currentPoints === pt
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                  }`}
                >
                  +{pt}
                </button>
              ))}
            </div>
            {errors.points && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.points.message}</p>
            )}
          </div>

          {/* Sanction Recommendation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rekomendasi Tindak Lanjut / Sanksi (Opsional)
            </label>
            <input
              type="text"
              {...register("sanctionRecommendation")}
              placeholder="Contoh: Teguran lisan, pemanggilan orang tua, atau skorsing"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
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
              <span>{isPending ? "Menyimpan..." : "Simpan Aturan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
