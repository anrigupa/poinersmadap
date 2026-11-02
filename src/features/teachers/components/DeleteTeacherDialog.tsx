"use client";

import { useTransition } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { TeacherItem } from "@/features/teachers/types";
import { deleteTeacherAction } from "@/features/teachers/actions";

interface DeleteTeacherDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: TeacherItem | null;
  onSuccess: (message: string) => void;
}

export default function DeleteTeacherDialog({
  isOpen,
  onClose,
  teacher,
  onSuccess,
}: DeleteTeacherDialogProps) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !teacher) return null;

  const handleConfirm = () => {
    startTransition(async () => {
      const res = await deleteTeacherAction(teacher.id, teacher.profileId);
      if (res.success) {
        onSuccess(res.message);
        onClose();
      } else {
        alert(res.message || "Gagal menghapus data guru.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 z-10 p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="font-bold text-slate-900 text-base">Hapus Akun Guru?</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Akun <strong className="text-slate-800 font-bold">{teacher.fullName}</strong> (NIP: {teacher.nip}) beserta akses login Supabase Auth akan dihapus permanen dari sistem.
        </p>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm shadow-rose-500/20 disabled:opacity-60 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isPending ? "Menghapus..." : "Ya, Hapus Akun"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
