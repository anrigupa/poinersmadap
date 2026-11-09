"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  ShieldX,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  resetPasswordSchema,
  ResetPasswordFormData,
} from "@/features/auth/schemas/passwordResetSchema";

export default function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();

  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Verify and listen to Supabase recovery session on client
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      // 1. Check if Supabase client already has an active session from code exchange or cookie
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (session?.user) {
        setHasValidSession(true);
        setUserEmail(session.user.email || null);
        return;
      }

      // 2. If the URL contains implicit grant hash (#access_token=...&type=recovery), set session manually
      if (typeof window !== "undefined" && window.location.hash) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const type = params.get("type");

        if (accessToken && (type === "recovery" || type === "signup" || type === "magiclink")) {
          const { data: setSessionData, error: setSessionErr } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

          if (!isMounted) return;

          if (!setSessionErr && setSessionData.session?.user) {
            setHasValidSession(true);
            setUserEmail(setSessionData.session.user.email || null);
            // Clean hash from browser URL bar without reload
            window.history.replaceState(null, "", window.location.pathname);
            return;
          }
        }
      }

      // 3. If the URL contains query parameters (?token_hash=...&type=recovery or ?code=...)
      if (typeof window !== "undefined" && window.location.search) {
        const searchParams = new URLSearchParams(window.location.search);
        const token_hash = searchParams.get("token_hash");
        const type = searchParams.get("type");
        const code = searchParams.get("code");

        if (token_hash && type) {
          const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          });

          if (!isMounted) return;

          if (!verifyErr && verifyData.session?.user) {
            setHasValidSession(true);
            setUserEmail(verifyData.session.user.email || null);
            window.history.replaceState(null, "", window.location.pathname);
            return;
          }
        } else if (code) {
          const { data: codeData, error: codeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (!isMounted) return;
          if (!codeErr && codeData.session?.user) {
            setHasValidSession(true);
            setUserEmail(codeData.session.user.email || null);
            window.history.replaceState(null, "", window.location.pathname);
            return;
          }
        }
      }

      // If neither condition produced a user session, mark as invalid
      setHasValidSession(false);
    }

    checkSession();

    // Listen to auth state changes (e.g. PASSWORD_RECOVERY event)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        if (event === "PASSWORD_RECOVERY" || (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION"))) {
          setHasValidSession(true);
          setUserEmail(session?.user?.email || null);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const onSubmit = (data: ResetPasswordFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const { error } = await supabase.auth.updateUser({
          password: data.password,
        });

        if (error) {
          setErrorMessage(error.message || "Gagal memperbarui kata sandi. Silakan coba kembali.");
          return;
        }

        // Revoke / sign out so old sessions are terminated and the user logs in fresh
        try {
          await supabase.auth.signOut();
        } catch {
          // silent
        }

        setSuccessMessage("Kata sandi berhasil diperbarui.");

        // Redirect to /login after short delay
        setTimeout(() => {
          router.push("/login");
          router.refresh();
        }, 1500);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan sistem saat memperbarui kata sandi.";
        setErrorMessage(message);
      }
    });
  };

  // State 1: Checking recovery session
  if (hasValidSession === null) {
    return (
      <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium">
          Memvalidasi sesi pemulihan akun...
        </span>
      </div>
    );
  }

  // State 2: Invalid or expired recovery token
  if (hasValidSession === false) {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldX className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900">
            Tautan Pemulihan Tidak Valid
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            Tautan reset kata sandi sudah kadaluarsa, telah digunakan, atau dibuka tanpa token keamanan yang sah.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <span>Kirim Ulang Tautan Reset</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // State 3: Valid recovery session — display reset password form
  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-semibold text-blue-700 mb-2">
          <KeyRound className="w-3 h-3" />
          <span>Sesi Pemulihan Terverifikasi</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Atur Kata Sandi Baru
        </h2>
        {userEmail && (
          <p className="text-xs text-slate-500 mt-1">
            Untuk akun: <strong className="text-slate-700 font-semibold">{userEmail}</strong>
          </p>
        )}
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
                Mengalihkan Anda ke halaman login...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Password Baru */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Kata Sandi Baru
            </label>
            <span className="text-[11px] text-slate-400">Min. 8 karakter</span>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="••••••••"
              disabled={Boolean(successMessage)}
              className={`w-full px-3.5 py-2.5 pr-10 pl-10 bg-slate-50/70 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                errors.password
                  ? "border-rose-300 focus:ring-rose-400 bg-rose-50/30"
                  : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
              }`}
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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

        {/* Konfirmasi Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Konfirmasi Kata Sandi Baru
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="••••••••"
              disabled={Boolean(successMessage)}
              className={`w-full px-3.5 py-2.5 pr-10 pl-10 bg-slate-50/70 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                errors.confirmPassword
                  ? "border-rose-300 focus:ring-rose-400 bg-rose-50/30"
                  : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
              }`}
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[11px] text-rose-600 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Simpan Kata Sandi Button */}
        <button
          type="submit"
          disabled={isPending || Boolean(successMessage)}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Simpan Kata Sandi</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
