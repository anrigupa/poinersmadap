"use client";

import { useState } from "react";
import { X, KeyRound, Copy, Check, Sparkles, AlertCircle } from "lucide-react";
import { StudentItem } from "@/features/students/types";

interface ResetStudentPasswordModalProps {
  isOpen: boolean;
  student: StudentItem | null;
  onClose: () => void;
  onSubmit: (student: StudentItem, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

export default function ResetStudentPasswordModal({
  isOpen,
  student,
  onClose,
  onSubmit,
}: ResetStudentPasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const handleGenerate = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let pwd = "Siswa@";
    for (let i = 0; i < 4; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
  };

  const handleCopy = () => {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorBanner("Password minimal 6 karakter");
      return;
    }

    setSubmitting(true);
    setErrorBanner(null);
    try {
      const res = await onSubmit(student, newPassword);
      if (!res.success) {
        setErrorBanner(res.message);
      } else {
        onClose();
      }
    } catch (err: any) {
      setErrorBanner(err.message || "Gagal mereset password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Reset Password Siswa
              </h3>
              <p className="text-xs text-slate-500">
                Perbarui kata sandi login Supabase Auth siswa
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

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {errorBanner && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorBanner}</span>
            </div>
          )}

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
            <div className="font-bold text-slate-800">{student.fullName}</div>
            <div className="text-slate-500 font-mono text-[11px]">
              NISN: {student.nisn} | NIS: {student.nis}
            </div>
            <div className="text-slate-400 text-[11px]">{student.email}</div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Password Baru
              </label>
              <button
                type="button"
                onClick={handleGenerate}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-medium hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Acak Otomatis
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan kata sandi minimal 6 karakter"
                className="w-full pl-3 pr-20 py-2.5 text-xs font-mono rounded-xl border border-slate-200 focus:border-amber-500 focus:outline-hidden transition"
              />
              <button
                type="button"
                onClick={handleCopy}
                disabled={!newPassword}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg flex items-center gap-1 transition disabled:opacity-40"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
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
              type="submit"
              disabled={submitting || !newPassword}
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                "Simpan Password Baru"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
