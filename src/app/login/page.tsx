import { Suspense } from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, School, Sparkles } from "lucide-react";
import LoginForm from "@/features/auth/components/LoginForm";

export const metadata = {
  title: "Login Portal - SMADAP POINER",
  description: "Portal masuk Sistem Informasi Poin Pelanggaran Siswa SMADAP",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-slate-950 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Ambience & Gradient Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition group py-2 px-3 rounded-xl hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sistem Aktif & Terlindungi</span>
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
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              SMADAP POINER
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Sistem Informasi Poin Pelanggaran & Tata Tertib Siswa
            </p>
          </div>

          {/* Login Form Client Component */}
          <Suspense
            fallback={
              <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                <span>Memuat formulir otentikasi...</span>
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6 text-[11px] text-slate-500">
          SMAN 2 PANGKEP &bull; Hak Cipta Dilindungi Undang-Undang
        </div>
      </div>

      {/* Bottom spacer for flex alignment */}
      <footer className="relative z-10 py-4 text-center text-[10px] text-slate-600">
        Versi 1.0.0 (Next.js 15 App Router & Supabase Auth)
      </footer>
    </main>
  );
}
