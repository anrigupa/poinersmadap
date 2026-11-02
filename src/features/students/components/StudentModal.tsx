"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, UserPlus, Save, Key, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { StudentItem, StudentMajor, StudentGender } from "@/features/students/types";
import { studentFormSchema, StudentFormData } from "@/features/students/schemas";

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StudentFormData) => Promise<{ success: boolean; message: string }>;
  initialData?: StudentItem | null;
}

const COMMON_CLASSES = [
  "X MIPA 1",
  "X MIPA 2",
  "X IPS 1",
  "X IPS 2",
  "X RPL 1",
  "XI MIPA 1",
  "XI MIPA 2",
  "XI IPS 1",
  "XI IPS 2",
  "XI RPL 1",
  "XI Bahasa 1",
  "XII MIPA 1",
  "XII MIPA 2",
  "XII MIPA 3",
  "XII IPS 1",
  "XII IPS 2",
];

const MAJORS: { value: StudentMajor; label: string }[] = [
  { value: "MIPA", label: "MIPA (Matematika & IPA)" },
  { value: "IPS", label: "IPS (Ilmu Pengetahuan Sosial)" },
  { value: "Bahasa", label: "Bahasa & Budaya" },
  { value: "RPL", label: "Rekayasa Perangkat Lunak" },
  { value: "TKJ", label: "Teknik Komputer Jaringan" },
  { value: "Umum", label: "Umum" },
];

export default function StudentModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: StudentModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      nisn: "",
      nis: "",
      fullName: "",
      email: "",
      className: "X MIPA 1",
      major: "MIPA",
      gender: "L",
      parentName: "",
      parentPhone: "",
      temporaryPassword: "",
    },
  });

  const nisValue = watch("nis");
  const classValue = watch("className");

  // Reset or initialize values when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorBanner(null);
      if (initialData) {
        reset({
          nisn: initialData.nisn,
          nis: initialData.nis,
          fullName: initialData.fullName,
          email: initialData.email,
          className: initialData.className,
          major: initialData.major,
          gender: initialData.gender,
          parentName: initialData.parentName || "",
          parentPhone: initialData.parentPhone || "",
          temporaryPassword: "",
        });
      } else {
        const randomNis = Math.floor(10300 + Math.random() * 899).toString();
        const randomNisn = `00${Math.floor(50000000 + Math.random() * 49999999)}`;
        reset({
          nisn: randomNisn,
          nis: randomNis,
          fullName: "",
          email: `siswa.${randomNis}@smadap.sch.id`,
          className: "X MIPA 1",
          major: "MIPA",
          gender: "L",
          parentName: "",
          parentPhone: "",
          temporaryPassword: `Siswa${randomNis}!`,
        });
      }
    }
  }, [isOpen, initialData, reset]);

  // Suggest major when class changes
  const handleClassChange = (selectedClass: string) => {
    setValue("className", selectedClass);
    if (selectedClass.includes("MIPA") || selectedClass.includes("IPA")) {
      setValue("major", "MIPA");
    } else if (selectedClass.includes("IPS")) {
      setValue("major", "IPS");
    } else if (selectedClass.includes("Bahasa")) {
      setValue("major", "Bahasa");
    } else if (selectedClass.includes("RPL")) {
      setValue("major", "RPL");
    } else if (selectedClass.includes("TKJ")) {
      setValue("major", "TKJ");
    }
  };

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let pwd = "Smadap@";
    for (let i = 0; i < 4; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue("temporaryPassword", pwd);
  };

  const handleFormSubmit = async (data: StudentFormData) => {
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
      setErrorBanner(err.message || "Terjadi kesalahan pada server");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl border border-slate-100 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              {isEditing ? <Save className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? "Edit Data Siswa" : "Tambah Siswa Baru"}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? "Perbarui informasi dan biodata siswa"
                  : "Mendaftarkan siswa dan otomatis membuat akun Supabase Auth"}
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
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorBanner}</span>
            </div>
          )}

          {/* Grid NISN & NIS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NISN (10 Digit) <span className="text-red-500">*</span>
              </label>
              <input
                {...register("nisn")}
                type="text"
                placeholder="Contoh: 0061928374"
                className={`w-full px-3 py-2 text-xs rounded-xl border font-mono ${
                  errors.nisn ? "border-red-400 bg-red-50/20" : "border-slate-200 focus:border-blue-500"
                } focus:outline-hidden transition`}
              />
              {errors.nisn && (
                <p className="text-[11px] text-red-500 mt-1">{errors.nisn.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIS (Buku Induk) <span className="text-red-500">*</span>
              </label>
              <input
                {...register("nis")}
                type="text"
                placeholder="Contoh: 10293"
                className={`w-full px-3 py-2 text-xs rounded-xl border font-mono ${
                  errors.nis ? "border-red-400 bg-red-50/20" : "border-slate-200 focus:border-blue-500"
                } focus:outline-hidden transition`}
              />
              {errors.nis && (
                <p className="text-[11px] text-red-500 mt-1">{errors.nis.message}</p>
              )}
            </div>
          </div>

          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap Siswa <span className="text-red-500">*</span>
            </label>
            <input
              {...register("fullName")}
              type="text"
              placeholder="Contoh: Muhammad Rizky Pratama"
              className={`w-full px-3 py-2 text-xs rounded-xl border ${
                errors.fullName ? "border-red-400 bg-red-50/20" : "border-slate-200 focus:border-blue-500"
              } focus:outline-hidden transition`}
            />
            {errors.fullName && (
              <p className="text-[11px] text-red-500 mt-1">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email Login */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Email Akun Siswa (Supabase Auth) <span className="text-red-500">*</span>
              </label>
              {nisValue && !isEditing && (
                <button
                  type="button"
                  onClick={() => setValue("email", `siswa.${nisValue}@smadap.sch.id`)}
                  className="text-[10px] text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Format Default
                </button>
              )}
            </div>
            <input
              {...register("email")}
              type="email"
              placeholder="siswa.10293@smadap.sch.id"
              className={`w-full px-3 py-2 text-xs rounded-xl border ${
                errors.email ? "border-red-400 bg-red-50/20" : "border-slate-200 focus:border-blue-500"
              } focus:outline-hidden transition`}
            />
            {errors.email && (
              <p className="text-[11px] text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Kelas & Jurusan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kelas <span className="text-red-500">*</span>
              </label>
              <select
                {...register("className")}
                onChange={(e) => handleClassChange(e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-xl border bg-white ${
                  errors.className ? "border-red-400" : "border-slate-200 focus:border-blue-500"
                } focus:outline-hidden transition`}
              >
                {COMMON_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.className && (
                <p className="text-[11px] text-red-500 mt-1">{errors.className.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jurusan <span className="text-red-500">*</span>
              </label>
              <select
                {...register("major")}
                className={`w-full px-3 py-2 text-xs rounded-xl border bg-white ${
                  errors.major ? "border-red-400" : "border-slate-200 focus:border-blue-500"
                } focus:outline-hidden transition`}
              >
                {MAJORS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              {errors.major && (
                <p className="text-[11px] text-red-500 mt-1">{errors.major.message}</p>
              )}
            </div>
          </div>

          {/* Gender & Orang Tua */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                {...register("gender")}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-hidden transition"
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Wali / Orang Tua
              </label>
              <input
                {...register("parentName")}
                type="text"
                placeholder="Nama orang tua"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. Telp / HP Wali
              </label>
              <input
                {...register("parentPhone")}
                type="text"
                placeholder="0812xxxxxxxx"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden transition"
              />
            </div>
          </div>

          {/* Password Sementara (Hanya untuk tambah siswa baru) */}
          {!isEditing && (
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                  Password Sementara Login Siswa
                </div>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[10px] text-blue-600 hover:text-blue-700 font-medium hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Acak Password
                </button>
              </div>
              <input
                {...register("temporaryPassword")}
                type="text"
                placeholder="Siswa10293! (otomatis dibuat jika dikosongkan)"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono bg-white focus:border-blue-500 focus:outline-hidden"
              />
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Akun Supabase Auth dengan role `siswa` otomatis terbuat aktif.</span>
              </div>
            </div>
          )}

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
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Daftarkan Siswa
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
