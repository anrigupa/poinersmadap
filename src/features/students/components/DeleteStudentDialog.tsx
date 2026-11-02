"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { StudentItem } from "@/features/students/types";

interface DeleteStudentDialogProps {
  isOpen: boolean;
  student: StudentItem | null;
  onClose: () => void;
  onConfirm: (student: StudentItem) => Promise<{ success: boolean; message: string }>;
}

export default function DeleteStudentDialog({
  isOpen,
  student,
  onClose,
  onConfirm,
}: DeleteStudentDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !student) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await onConfirm(student);
      if (res.success) {
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-red-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hapus Data Siswa
              </h3>
              <p className="text-xs text-slate-500">Konfirmasi tindakan permanen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin menghapus data siswa{" "}
            <span className="font-bold text-slate-900">{student.fullName}</span> (NISN: {student.nisn}, Kelas: {student.className})?
          </p>

          <div className="p-3 bg-red-50/60 border border-red-100 rounded-xl text-xs text-red-700 space-y-1">
            <div className="font-semibold">Perhatian:</div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-red-600">
              <li>Akun login Supabase Auth siswa akan dihapus permanen.</li>
              <li>Siswa tidak akan dapat masuk kembali ke dashboard.</li>
            </ul>
          </div>

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
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Hapus Permanen
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
