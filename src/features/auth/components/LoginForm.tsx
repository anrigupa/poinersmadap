"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Lock,
  UserCheck,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle2,
  Sparkles,
  School,
  ArrowRight,
} from "lucide-react";
import { loginSchema, LoginFormData } from "@/features/auth/schemas/loginSchema";
import { signInAction } from "@/features/auth/actions/authActions";
import { DEMO_ACCOUNTS, ROLE_LABELS } from "@/lib/constants/auth";
import { UserRole } from "@/types/auth";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [selectedRole, setSelectedRole] = useState<UserRole>("guru");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: "guru",
      identifier: DEMO_ACCOUNTS.guru.profile.email,
      password: DEMO_ACCOUNTS.guru.passwordHint,
    },
  });

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setValue("role", role);
    setValue("identifier", DEMO_ACCOUNTS[role].profile.email);
    setValue("password", DEMO_ACCOUNTS[role].passwordHint);
    setErrorMessage(null);
  };

  const handleApplyDemoCredentials = (role: UserRole) => {
    handleRoleChange(role);
  };

  const onSubmit = (data: LoginFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const result = await signInAction(data);
        if (result.success) {
          setSuccessMessage(result.message || "Login berhasil!");
          const destination = callbackUrl || result.redirectTo || "/";
          setTimeout(() => {
            router.push(destination);
            router.refresh();
          }, 600);
        } else {
          setErrorMessage(result.message || "Gagal masuk. Periksa kembali akun Anda.");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem saat otentikasi.";
        setErrorMessage(message);
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Role Selection Tabs */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 grid grid-cols-3 gap-1 mb-6">
        {(["admin", "guru", "siswa"] as UserRole[]).map((role) => {
          const isSelected = selectedRole === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => handleRoleChange(role)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                isSelected
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <UserCheck className={`w-3.5 h-3.5 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
              <span className="capitalize">{role}</span>
            </button>
          );
        })}
      </div>

      {/* Role Context Pill */}
      <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border border-blue-100 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-blue-500/20">
          <School className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-900">{ROLE_LABELS[selectedRole].title}</div>
          <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
            {ROLE_LABELS[selectedRole].subtitle}
          </div>
        </div>
      </div>

      {/* Error & Success Feedback Alerts */}
      <AnimatePresence mode="wait">
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2"
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
            className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("role")} />

        {/* Identifier Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {selectedRole === "admin" && "Email / Username Administrator"}
            {selectedRole === "guru" && "NIP / Email Guru"}
            {selectedRole === "siswa" && "NIS / Email Siswa"}
          </label>
          <div className="relative">
            <input
              type="text"
              {...register("identifier")}
              placeholder={
                selectedRole === "admin"
                  ? "admin@smadap.sch.id"
                  : selectedRole === "guru"
                  ? "guru.bk@smadap.sch.id atau NIP"
                  : "10293 atau siswa@smadap.sch.id"
              }
              className={`w-full px-3.5 py-2.5 bg-slate-50/70 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                errors.identifier
                  ? "border-rose-300 focus:ring-rose-400 bg-rose-50/30"
                  : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
              }`}
            />
          </div>
          {errors.identifier && (
            <p className="text-[11px] text-rose-600 mt-1">{errors.identifier.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700">Kata Sandi</label>
            <span className="text-[11px] text-slate-400">Min. 4 karakter</span>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="••••••••"
              className={`w-full px-3.5 py-2.5 pr-10 bg-slate-50/70 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                errors.password
                  ? "border-rose-300 focus:ring-rose-400 bg-rose-50/30"
                  : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-rose-600 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Masuk sebagai {selectedRole.toUpperCase()}</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </>
          )}
        </button>
      </form>

      {/* Quick Demo Credentials Bar */}
      <div className="mt-8 pt-6 border-t border-slate-200/80">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Isi Cepat Akun Demo (Evaluasi Mandiri):</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["admin", "guru", "siswa"] as UserRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleApplyDemoCredentials(r)}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded-lg border border-slate-200/70 text-center transition truncate"
            >
              Demo {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
