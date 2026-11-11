"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  PlusCircle,
  AlertTriangle,
  Search,
  Check,
  Calendar,
  FileText,
  Camera,
  GraduationCap,
  ShieldAlert,
} from "lucide-react";
import { StudentItem } from "@/features/students/types";
import { ViolationItem } from "@/features/rules/types";
import { addViolationSchema, AddViolationFormData } from "@/features/teacher-dashboard/schemas";
import ViolationSelector from "@/components/ui/ViolationSelector";

interface AddViolationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddViolationFormData) => Promise<{ success: boolean; message: string }>;
  students: StudentItem[];
  rules: ViolationItem[];
}

export default function AddViolationModal({
  isOpen,
  onClose,
  onSubmit,
  students,
  rules,
}: AddViolationModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Student search state
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  // Selected rule
  const [selectedRule, setSelectedRule] = useState<ViolationItem | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<AddViolationFormData>({
    resolver: zodResolver(addViolationSchema),
    defaultValues: {
      studentId: "",
      studentNis: "",
      studentName: "",
      className: "",
      violationTypeId: "",
      ruleCode: "",
      violationName: "",
      categoryName: "",
      points: 5,
      notes: "",
      incidentDate: "2026-11-02T15:00",
      evidenceUrl: "",
    },
  });

  // Current ISO date for default input
  useEffect(() => {
    if (isOpen) {
      setErrorBanner(null);
      const now = new Date();
      // Format to YYYY-MM-DDTHH:mm
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      const defaultTime = `${year}-${month}-${day}T${hours}:${mins}`;

      reset({
        studentId: "",
        studentNis: "",
        studentName: "",
        className: "",
        violationTypeId: "",
        ruleCode: "",
        violationName: "",
        categoryName: "",
        points: 5,
        notes: "",
        incidentDate: defaultTime,
        evidenceUrl: "",
      });
      setSelectedStudent(null);
      setSelectedRule(null);
      setStudentSearch("");
    }
  }, [isOpen, reset]);

  // Handle student selection
  const handleSelectStudent = (student: StudentItem) => {
    setSelectedStudent(student);
    setValue("studentId", student.id);
    setValue("studentNis", student.nis);
    setValue("studentName", student.fullName);
    setValue("className", student.className);
    setShowStudentDropdown(false);
  };

  // Handle rule selection
  const handleSelectRule = (ruleId: string, rule: ViolationItem | null) => {
    if (rule) {
      setSelectedRule(rule);
      setValue("violationTypeId", rule.id, { shouldValidate: true });
      setValue("ruleCode", rule.code);
      setValue("violationName", rule.name);
      setValue("categoryName", rule.categoryName);
      setValue("points", rule.points);
    } else {
      setSelectedRule(null);
      setValue("violationTypeId", "", { shouldValidate: true });
      setValue("ruleCode", "");
      setValue("violationName", "");
      setValue("categoryName", "");
      setValue("points", 5);
    }
  };

  // Filtered students for autocomplete
  const filteredStudents = students.filter((s) => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.nis.includes(q) ||
      s.nisn.includes(q) ||
      s.className.toLowerCase().includes(q)
    );
  }).slice(0, 6);

  const handleFormSubmit = async (data: AddViolationFormData) => {
    if (!selectedStudent) {
      setErrorBanner("Silakan pilih siswa yang melanggar terlebih dahulu.");
      return;
    }
    if (!selectedRule) {
      setErrorBanner("Silakan pilih pasal atau jenis pelanggaran.");
      return;
    }

    setSubmitting(true);
    setErrorBanner(null);
    try {
      const res = await onSubmit(data);
      if (!res.success) {
        setErrorBanner(res.message);
      } else {
        onClose();
      }
    } catch (err: any) {
      setErrorBanner(err.message || "Gagal menyimpan laporan pelanggaran.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl border border-slate-100 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-blue-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Input Cepat Pelanggaran Siswa
              </h3>
              <p className="text-xs text-slate-500">
                Catat pelanggaran langsung tanpa meninggalkan dashboard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {errorBanner && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorBanner}</span>
            </div>
          )}

          {/* 1. Pilih Siswa (Autocomplete Search) */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Siswa <span className="text-red-500">*</span>
            </label>

            {selectedStudent ? (
              <div className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {selectedStudent.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">
                      {selectedStudent.fullName}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span className="font-mono">NIS: {selectedStudent.nis}</span>
                      <span>•</span>
                      <span className="font-semibold text-blue-700">
                        {selectedStudent.className}
                      </span>
                      <span>•</span>
                      <span>Poin Saat Ini: {selectedStudent.totalViolationPoints}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudent(null);
                    setValue("studentId", "");
                    setValue("studentNis", "");
                    setValue("studentName", "");
                    setValue("className", "");
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => {
                      setStudentSearch(e.target.value);
                      setShowStudentDropdown(true);
                    }}
                    onFocus={() => setShowStudentDropdown(true)}
                    placeholder="Cari nama, NIS, atau kelas siswa..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden transition"
                  />
                </div>

                {/* Dropdown suggestions */}
                {showStudentDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => handleSelectStudent(st)}
                          className="w-full p-2.5 text-left hover:bg-blue-50/50 flex items-center justify-between transition"
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-800">
                              {st.fullName}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              NIS: {st.nis} • Kelas: {st.className}
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {st.totalViolationPoints} Poin
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-400">
                        Tidak ada siswa yang sesuai
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {errors.studentId && (
              <p className="text-[11px] text-red-500 mt-1">
                {errors.studentId.message}
              </p>
            )}
          </div>

          {/* 2. Pilih Jenis Pelanggaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pasal / Jenis Pelanggaran <span className="text-red-500">*</span>
            </label>
            <ViolationSelector
              rules={rules}
              value={selectedRule?.id || ""}
              onChange={handleSelectRule}
              placeholder="-- Pilih Jenis Pelanggaran --"
              searchPlaceholder="Cari jenis pelanggaran..."
              error={errors.violationTypeId?.message}
            />
            {errors.violationTypeId && (
              <p className="text-[11px] text-red-500 mt-1">
                {errors.violationTypeId.message}
              </p>
            )}
          </div>

          {/* Rule Details Badge & Points Preview */}
          {selectedRule && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-800">
                  {selectedRule.code}: {selectedRule.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  Kategori:{" "}
                  <strong className="text-slate-700">
                    {selectedRule.categoryName}
                  </strong>
                </div>
              </div>
              <div className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-xs">
                +{selectedRule.points} Poin
              </div>
            </div>
          )}

          {/* 3. Waktu & Tanggal Kejadian */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Waktu Kejadian Insiden <span className="text-red-500">*</span>
            </label>
            <input
              {...register("incidentDate")}
              type="datetime-local"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden transition"
            />
            {errors.incidentDate && (
              <p className="text-[11px] text-red-500 mt-1">
                {errors.incidentDate.message}
              </p>
            )}
          </div>

          {/* 4. Kronologis Kejadian (Catatan) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kronologis / Catatan Kejadian <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              placeholder="Jelaskan secara ringkas dan objektif lokasi insiden, saksi, dan situasi saat pelanggaran terjadi..."
              className={`w-full px-3 py-2 text-xs rounded-xl border ${
                errors.notes ? "border-red-400" : "border-slate-200"
              } focus:border-blue-500 focus:outline-hidden transition`}
            />
            {errors.notes && (
              <p className="text-[11px] text-red-500 mt-1">{errors.notes.message}</p>
            )}
          </div>

          {/* 5. Lampiran Bukti Foto (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Link Bukti Foto / Unggahan (Opsional)
            </label>
            <div className="relative">
              <Camera className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                {...register("evidenceUrl")}
                type="url"
                placeholder="https://... atau URL foto barang bukti/insiden"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden transition"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              File foto bukti akan disimpan dalam bucket Supabase Storage (violation-evidence).
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan Laporan...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  Simpan & Catat Poin
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
