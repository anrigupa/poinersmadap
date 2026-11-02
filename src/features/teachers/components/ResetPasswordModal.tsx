"use client";

import { useState, useTransition } from "react";
import { X, KeyRound, Copy, Check, RefreshCw } from "lucide-react";
import { TeacherItem } from "@/features/teachers/types";
import { resetTeacherPasswordAction } from "@/features/teachers/actions";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: TeacherItem | null;
  onSuccess: (message: string) => void;
}

export default function ResetPasswordModal({
  isOpen,
  onClose,
  teacher,
  onSuccess,
}: ResetPasswordModalProps) {
  const [isPending, startTransition] = useTransition();
  const [newPassword, setNewPassword] = useState("Guru" + Math.floor(1000 + Math.random() * 9000) + "!");
  const [copied, setCopied] = useState(false);

  if (!isOpen || !teacher) return null;

  const handleGenerate = () => {
    setNewPassword("Guru" + Math.floor(1000 + Math.random() * 9000) + "!");
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await resetTeacherPasswordAction(teacher.profileId, newPassword);
      if (res.success) {
        onSuccess(res.message);
        onClose();
      } else {
        alert(res.message || "Gagal mereset kata sandi.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 z-10 p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Reset Kata Sandi Akun</h3>
              <p className="text-[11px] text-slate-400">Sinkronisasi langsung ke Supabase Auth</p>
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

        <form onSubmit={handleResetSubmit} className="mt-4 space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-xs font-bold text-slate-800">{teacher.fullName}</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">NIP: {teacher.nip} &bull; {teacher.email}</div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Kata Sandi Baru Sementara</label>
              <button
                type="button"
                onClick={handleGenerate}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Acak Ulang</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-900 bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer shrink-0"
                title="Salin kata sandi"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Tersalin" : "Salin"}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Guru dapat langsung menggunakan kata sandi ini untuk login ke portal.
            </p>
          </div>

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
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm shadow-amber-500/20 disabled:opacity-60 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isPending ? "Mereset..." : "Konfirmasi Reset Password"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
