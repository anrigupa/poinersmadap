"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, UserPlus, Save, ShieldCheck, KeyRound, Sparkles } from "lucide-react";
import { teacherFormSchema, TeacherFormData } from "@/features/teachers/schemas";
import { TeacherItem, TeacherSpecialization } from "@/features/teachers/types";
import { addTeacherAction, editTeacherAction } from "@/features/teachers/actions";

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherToEdit?: TeacherItem | null;
  onSuccess: (message: string) => void;
}

export default function TeacherModal({
  isOpen,
  onClose,
  teacherToEdit,
  onSuccess,
}: TeacherModalProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      nip: "",
      fullName: "",
      email: "",
      specialization: "guru_piket",
      assignedClass: "",
      temporaryPassword: "Guru123!",
    },
  });

  const selectedSpecialization = watch("specialization");

  useEffect(() => {
    if (teacherToEdit) {
      reset({
        nip: teacherToEdit.nip,
        fullName: teacherToEdit.fullName,
        email: teacherToEdit.email,
        specialization: teacherToEdit.specialization as TeacherSpecialization,
        assignedClass: teacherToEdit.assignedClass || "",
        temporaryPassword: "",
      });
    } else {
      reset({
        nip: "",
        fullName: "",
        email: "",
        specialization: "guru_piket",
        assignedClass: "",
        temporaryPassword: "Guru123!",
      });
    }
  }, [teacherToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = (data: TeacherFormData) => {
    startTransition(async () => {
      let res;
      if (teacherToEdit) {
        res = await editTeacherAction(teacherToEdit.id, teacherToEdit.profileId, data);
      } else {
        res = await addTeacherAction(data);
      }

      if (res.success) {
        onSuccess(res.message);
        onClose();
      } else {
        alert(res.message || "Gagal menyimpan data guru.");
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
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {teacherToEdit ? "Edit Data Guru / Tenaga Pendidik" : "Tambah Guru & Akun Auth Baru"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {teacherToEdit ? "Perbarui informasi profil dan penugasan" : "Otomatis membuat akun otentikasi login Supabase"}
              </p>
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
          {/* NIP Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Induk Pegawai (NIP) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register("nip")}
              placeholder="Contoh: 198504122010012003"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                errors.nip
                  ? "border-rose-300 focus:ring-rose-200"
                  : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
              }`}
            />
            {errors.nip && <p className="text-[11px] text-rose-500 mt-1">{errors.nip.message}</p>}
          </div>

          {/* Full Name Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap & Gelar <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register("fullName")}
              placeholder="Contoh: Siti Rahmawati, S.Pd"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                errors.fullName
                  ? "border-rose-300 focus:ring-rose-200"
                  : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
              }`}
            />
            {errors.fullName && <p className="text-[11px] text-rose-500 mt-1">{errors.fullName.message}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Email (Username Akun) <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="Contoh: guru.bk@smadap.sch.id"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                errors.email
                  ? "border-rose-300 focus:ring-rose-200"
                  : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
              }`}
            />
            {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Specialization / Duty Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tugas / Peran Khusus <span className="text-rose-500">*</span>
              </label>
              <select
                {...register("specialization")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              >
                <option value="guru_piket">Guru Piket (Input Pelanggaran Harian)</option>
                <option value="wali_kelas">Wali Kelas (Pemantauan Kelas Binaan)</option>
                <option value="guru_bk">Guru BK (Bimbingan Konseling & Pemutihan)</option>
                <option value="guru_mapel">Guru Mata Pelajaran</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kelas Binaan (Khusus Wali Kelas)
              </label>
              <input
                type="text"
                {...register("assignedClass")}
                placeholder="Contoh: X MIPA 1 atau XI RPL 2"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>
          </div>

          {/* Automatic Supabase Auth Account Banner (Only when adding) */}
          {!teacherToEdit && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-bold text-slate-900">
                  Otomatisasi Akun Supabase Auth
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Akun otentikasi login akan dibuat secara instan dengan role <strong className="text-blue-700 font-bold">&quot;guru&quot;</strong>. Guru dapat langsung masuk menggunakan Email di atas dan Kata Sandi Sementara:
              </p>
              <div className="flex items-center gap-2 pt-1">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  {...register("temporaryPassword")}
                  placeholder="Guru123!"
                  className="w-40 px-2.5 py-1 text-xs font-mono font-bold bg-white rounded-lg border border-slate-300 text-blue-700"
                />
                <span className="text-[10px] text-slate-400">Password default guru baru</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
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
              <span>{isPending ? "Memproses..." : teacherToEdit ? "Simpan Perubahan" : "Buat Akun Guru"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
