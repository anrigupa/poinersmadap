"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
} from "@/features/auth/schemas/passwordResetSchema";
import { sendPasswordResetEmailAction } from "@/features/auth/actions/authActions";

export default function ForgotPasswordForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const origin =
          typeof window !== "undefined" && window.location.origin
            ? window.location.origin
            : undefined;
        const redirectUrl = origin ? `${origin}/reset-password` : undefined;

        const result = await sendPasswordResetEmailAction(data, redirectUrl);
        if (result.success) {
          setSuccessMessage(result.message);
        } else {
          setErrorMessage(result.message);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan sistem saat memproses permintaan.";
        setErrorMessage(message);
      }
    });
  };

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Lupa Kata Sandi
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
          Masukkan email yang terdaftar untuk menerima tautan reset kata sandi.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5"
          >
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">{successMessage}</span>
              <span className="text-[11px] text-emerald-700 block">
                Silakan periksa kotak masuk atau folder spam email Anda.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Alamat Email Terdaftar
          </label>
          <div className="relative">
            <input
              type="email"
              {...register("email")}
              placeholder="nama@smadap.sch.id atau email Anda"
              className={`w-full px-3.5 py-2.5 pl-10 bg-slate-50/70 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                errors.email
                  ? "border-rose-300 focus:ring-rose-400 bg-rose-50/30"
                  : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
              }`}
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Kirim Tautan Reset</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Halaman Masuk</span>
        </Link>
      </div>
    </div>
  );
}
