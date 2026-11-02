"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Shield, Globe2, Sparkles, TrendingUp } from "lucide-react";
import ShieldCenterpiece from "@/components/ShieldCenterpiece";
import Padlock3DIcon from "@/components/Padlock3DIcon";
import QuickModals from "@/components/QuickModals";

export default function LandingPage() {
  const [activeModal, setActiveModal] = useState<"cek-poin" | "buku-saku" | "login" | null>(null);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-hero-radial select-none flex flex-col justify-between">
      {/* Cahaya Ambient Lembut di Tengah & Sudut */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-white/60 blur-3xl rounded-full" />
        <div className="absolute bottom-[-120px] left-1/2 -translate-x-1/2 w-[900px] h-[380px] bg-blue-400/20 blur-3xl rounded-full" />
      </div>

      {/* =====================================================================
          1. TOP NAVIGATION BAR (Muncul di detik 1.15s setelah perisai meluncur)
         ===================================================================== */}
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.15, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-30 w-full max-w-[1440px] mx-auto px-6 sm:px-12 pt-6 flex items-center justify-between"
      >
        {/* Logo Kiri (Bentuk siluet dinamis/perisai seperti referensi) */}
        <button
          onClick={() => setActiveModal("cek-poin")}
          className="flex items-center gap-2.5 group text-left focus:outline-none"
        >
          <div className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md border border-white flex items-center justify-center shadow-sm group-hover:scale-105 transition">
            <Shield className="w-4 h-4 text-blue-600 fill-blue-600/20" />
          </div>
          <span className="font-bold tracking-tight text-slate-800 text-sm hidden sm:inline">
            SI<span className="text-blue-600">DISIPLIN</span>
          </span>
        </button>

        {/* Menu Navigasi Tengah */}
        <nav className="hidden lg:flex items-center gap-8 text-[11px] font-medium tracking-wide text-slate-600">
          <button onClick={() => setActiveModal(null)} className="hover:text-slate-950 transition">
            Beranda
          </button>
          <button onClick={() => setActiveModal("buku-saku")} className="hover:text-slate-950 transition">
            Aturan &amp; Poin
          </button>
          <button onClick={() => setActiveModal("cek-poin")} className="hover:text-slate-950 transition">
            Statistik Karakter
          </button>
          <button onClick={() => setActiveModal("cek-poin")} className="hover:text-slate-950 transition">
            Cek Poin Siswa
          </button>
          <button onClick={() => setActiveModal("login")} className="hover:text-slate-950 transition">
            Lapor BK
          </button>
          <button onClick={() => setActiveModal("login")} className="hover:text-slate-950 transition">
            Kontak
          </button>
        </nav>

        {/* Tombol Pill Kanan Atas */}
        <button
          onClick={() => setActiveModal("login")}
          className="px-5 py-2 rounded-full bg-white/90 hover:bg-white text-slate-800 text-xs font-semibold shadow-sm border border-white transition hover:scale-105 active:scale-95"
        >
          Portal Login
        </button>
      </motion.header>

      {/* =====================================================================
          2. TIPOGRAFI RAKSASA DI BELAKANG OBJEK ("DISIPLIN" / "BLUEBIRD" STYLE)
          Muncul perlahan di detik 1.65s dengan efek letter-spacing melebar
         ===================================================================== */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, letterSpacing: "0.02em" }}
        animate={{ opacity: 1, scale: 1, letterSpacing: "0.08em" }}
        transition={{ delay: 1.6, duration: 1.1, ease: "easeOut" }}
        className="pointer-events-none absolute inset-x-0 top-[22%] sm:top-[19%] z-0 flex justify-center items-center overflow-hidden"
      >
        <h1
          className="text-[17vw] sm:text-[15.5vw] font-serif font-normal uppercase text-white/45 tracking-widest leading-none select-none drop-shadow-[0_8px_30px_rgba(255,255,255,0.35)]"
          style={{
            WebkitTextStroke: "1px rgba(255, 255, 255, 0.55)",
          }}
        >
          DISIPLIN
        </h1>
      </motion.div>

      {/* =====================================================================
          3. OBJEK TENGAH: PERISAI TRANSPARAN 3D (Atau Video Argon Medium)
          Meluncur masuk dari detik 0.0s - 1.55s
         ===================================================================== */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center pb-4 sm:pb-0">
        {/* Ubah useCustomVideo={true} jika sudah menaruh file public/assets/shield-intro.mp4 */}
        <ShieldCenterpiece useCustomVideo={true} />
      </div>

      {/* =====================================================================
          4. KONTEN BAWAH: KIRI (HEADLINE & CTA) + KANAN (3 KARTU GLASSMORPHISM)
         ===================================================================== */}
      <section className="relative z-20 w-full max-w-[1440px] mx-auto px-6 sm:px-12 pb-7 sm:pb-10 pt-4 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
        
        {/* AREA KIRI: Headline 2 Baris & 2 Tombol Pill */}
        <motion.div
          initial={{ y: 35, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.25, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full lg:w-auto max-w-sm"
        >
          <div className="mb-6">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-800 leading-[1.08]">
              Ketertiban
            </h2>
            <p className="text-4xl sm:text-5xl font-light tracking-tight text-slate-500/90 leading-[1.08]">
              &amp; karakter
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Primary Solid Blue Pill Button */}
            <button
              onClick={() => setActiveModal("cek-poin")}
              className="group pl-5 pr-2 py-2 rounded-full bg-[#2575FC] hover:bg-blue-600 text-white text-xs font-medium flex items-center gap-3 shadow-lg shadow-blue-500/30 transition hover:scale-[1.03] active:scale-95"
            >
              <span>Cek Poin Siswa</span>
              <span className="w-7 h-7 rounded-full bg-white text-blue-600 flex items-center justify-center group-hover:rotate-45 transition">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </button>

            {/* Secondary Glass Pill Button */}
            <button
              onClick={() => setActiveModal("buku-saku")}
              className="px-5 py-3 rounded-full glass-pill hover:bg-white/80 text-slate-700 text-xs font-medium transition hover:scale-[1.03] active:scale-95"
            >
              Buku Saku Digital
            </button>
          </div>
        </motion.div>

        {/* AREA KANAN: Pill Avatar Sosial + 3 Kartu Bento Glassmorphism */}
        <div className="w-full lg:w-auto flex flex-col items-start lg:items-end gap-3.5">
          
          {/* Floating Social Proof Pill (Di atas kartu kanan) */}
          <motion.div
            initial={{ y: 25, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.35, duration: 0.7, ease: "easeOut" }}
            onClick={() => setActiveModal("cek-poin")}
            className="cursor-pointer glass-pill px-3 py-1.5 rounded-full flex items-center gap-3 shadow-sm hover:bg-white/75 transition"
          >
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                AP
              </div>
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-400 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                NS
              </div>
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                DA
              </div>
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                RK
              </div>
            </div>
            <div className="pr-2 text-xs text-slate-700">
              <span className="text-slate-500">Siswa Tertib </span>
              <strong className="font-bold text-slate-900">+850</strong>
            </div>
          </motion.div>

          {/* Barisan 3 Kartu Glassmorphism (Persis tata letak referensi) */}
          <div className="w-full lg:w-auto grid grid-cols-1 sm:grid-cols-3 items-end gap-3.5">
            
            {/* KARTU 1 (Kiri - Tinted Glass dengan Ikon Gembok 3D Transparan) */}
            <motion.div
              initial={{ y: 45, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setActiveModal("cek-poin")}
              className="cursor-pointer glass-card-dark rounded-[26px] p-4 sm:w-[230px] h-[126px] flex items-center gap-3.5 hover:scale-[1.02] transition"
            >
              <Padlock3DIcon />
              <div className="text-white">
                <p className="text-xs font-semibold leading-snug">
                  Rekap poin transparan &amp; terkunci aman
                </p>
                <span className="inline-block mt-1.5 text-[10px] text-blue-100/90">
                  Verifikasi real-time →
                </span>
              </div>
            </motion.div>

            {/* KARTU 2 (Tengah - Lebih Tinggi, Frosted Putih, Badge Bulat Biru di Kanan Atas) */}
            <motion.div
              initial={{ y: 55, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.52, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setActiveModal("login")}
              className="cursor-pointer relative glass-card-frosted rounded-[28px] p-5 sm:w-[220px] h-[168px] flex flex-col justify-between hover:scale-[1.02] transition"
            >
              {/* Badge Sfera Biru di Sudut Kanan Atas seperti di video */}
              <div className="absolute -top-3.5 right-4 w-10 h-10 rounded-full bg-gradient-to-tr from-blue-700 via-blue-500 to-cyan-300 shadow-md shadow-blue-500/30 flex items-center justify-center text-white border-2 border-white">
                <Globe2 className="w-5 h-5" />
              </div>

              <div className="mt-2">
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  Pantauan BK
                  <br />
                  Terintegrasi
                </h3>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Notifikasi otomatis untuk wali kelas, guru BK, dan orang tua siswa.
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] font-semibold text-blue-600 pt-1">
                <span>Buka Dashboard</span>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </motion.div>

            {/* KARTU 3 (Kanan - Frosted Glass dengan Angka Persentase Besar 98%) */}
            <motion.div
              initial={{ y: 45, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.64, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setActiveModal("buku-saku")}
              className="cursor-pointer glass-card-light rounded-[26px] p-4 sm:w-[215px] h-[126px] flex flex-col justify-between hover:scale-[1.02] transition"
            >
              <div className="flex items-start justify-between">
                <span className="text-4xl sm:text-[42px] font-light tracking-tight text-white drop-shadow-sm leading-none">
                  98<span className="text-2xl font-normal">%</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/50 text-[10px] font-semibold text-slate-700 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3 text-blue-600" /> +12%
                </span>
              </div>

              <p className="text-[10px] text-slate-600 leading-snug">
                Tingkat kedisiplinan &amp; kepatuhan tata tertib siswa semester aktif ini.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Modal Interaktif untuk Cek Poin, Buku Saku Digital, & Simulasi Login Role */}
      <QuickModals activeModal={activeModal} onClose={() => setActiveModal(null)} />
    </main>
  );
}
