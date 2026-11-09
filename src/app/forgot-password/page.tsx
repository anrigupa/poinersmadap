import { Suspense } from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";

export const metadata = {
  title: "Lupa Kata Sandi - SMADAP POINER",
  description: "Pemulihan dan reset kata sandi akun sistem kedisiplinan siswa SMADAP",
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen w-full bg-slate-950 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Ambience & Gradient Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition group py-2 px-3 rounded-xl hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Kembali ke Halaman Masuk</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Pemulihan Terproteksi</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-8">
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/40 rounded-3xl p-6 sm:p-8">
          {/* Header Branding */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-600/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
              SMADAP POINER
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Sistem Informasi Poin Pelanggaran & Tata Tertib Siswa
            </p>
          </div>

          <Suspense
            fallback={
              <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                <span>Memuat formulir pemulihan...</span>
              </div>
            }
          >
            <ForgotPasswordForm />
          </Suspense>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6 text-[11px] text-slate-500">
          SMAN 2 PANGKEP &bull; Layanan Pemulihan Akses Mandiri
        </div>
      </div>

      {/* Bottom spacer for flex alignment */}
      <footer className="relative z-10 py-4 text-center text-[10px] text-slate-600">
        Versi 1.0.0
      </footer>
    </main>
  );
}
