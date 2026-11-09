"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Shield, Globe2, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";
import ShieldCenterpiece from "@/components/ShieldCenterpiece";
import QuickModals from "@/components/QuickModals";
import { getSiswaTertibStatsAction } from "@/features/students/actions";
import { SiswaTertibStats } from "@/features/students/types";
import { createClient } from "@/lib/supabase/client";

export default function LandingPage() {
  const [activeModal, setActiveModal] = useState<"cek-poin" | "buku-saku" | "lapor-bk" | "top-pelanggaran" | null>(null);
  const [siswaTertibStats, setSiswaTertibStats] = useState<SiswaTertibStats>({
    totalSiswaTertib: 0,
    totalActiveStudents: 0,
    percentage: 100,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const stats = await getSiswaTertibStatsAction();
        if (isMounted) {
          setSiswaTertibStats(stats);
          setIsLoadingStats(false);
        }
      } catch (err) {
        console.warn("Gagal memuat statistik siswa tertib:", err);
        if (isMounted) setIsLoadingStats(false);
      }
    };

    fetchStats();

    // Supabase Realtime Listener for live updates when violations/students change
    const supabase = createClient();
    const channel = supabase
      .channel("landing-siswa-tertib-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students" },
        () => {
          fetchStats();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "student_violations" },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    // Periodic refetch fallback (e.g. every 30s) to keep stats fresh even in fallback mode
    const interval = setInterval(fetchStats, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

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
        {/* Logo Kiri (Branding POINER SMADAP - Non-clickable) */}
        <div className="flex items-center gap-2.5 select-none">
          <div className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md border border-white flex items-center justify-center shadow-sm">
            <Shield className="w-4 h-4 text-blue-600 fill-blue-600/20" />
          </div>
          <span className="font-bold tracking-tight text-slate-800 text-xs sm:text-sm">
            POINER <span className="text-blue-600">SMADAP</span>
          </span>
        </div>

        {/* Tombol Masuk Kanan Atas (Direct navigation to /login) */}
        <Link
          href="/login"
          className="px-5 py-2 rounded-full bg-white/90 hover:bg-white text-slate-800 text-xs font-semibold shadow-sm border border-white transition hover:scale-105 active:scale-95 flex items-center gap-1.5"
        >
          <span>Masuk</span>
        </Link>
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

        {/* AREA KANAN: Statistik Siswa Tertib + 2 Kartu Bento Glassmorphism */}
        <div className="w-full lg:w-auto flex flex-col items-start lg:items-end gap-3.5">
          
          {/* Informational Statistics Card: Siswa Tertib (Tier 1 Hero Stat) */}
          <motion.div
            initial={{ y: 25, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.35, duration: 0.7, ease: "easeOut" }}
            className="w-full sm:w-[484px] glass-card-light rounded-2xl sm:rounded-[24px] px-4 sm:px-5 py-3 border border-white/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xs shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                  {isLoadingStats ? (
                    <span className="inline-block w-8 h-5 bg-slate-200/80 rounded animate-pulse" />
                  ) : (
                    siswaTertibStats.totalSiswaTertib
                  )}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50/90 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                  Siswa Tertib
                </span>
              </div>
            </div>

            <div className="hidden sm:block h-6 w-px bg-slate-300/60" />

            <p className="text-[11px] text-slate-500 font-medium leading-tight max-w-[240px]">
              Siswa dengan total poin pelanggaran di bawah 50 poin
            </p>
          </motion.div>

          {/* Barisan 2 Kartu Glassmorphism (Tier 2 Bento Grid: 2 Equal Columns) */}
          <div className="w-full sm:w-[484px] grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* KARTU 1 (Pantauan BK Terintegrasi) */}
            <motion.div
              initial={{ y: 45, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.45, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setActiveModal("lapor-bk")}
              className="cursor-pointer relative glass-card-frosted rounded-[26px] p-5 h-[164px] flex flex-col justify-between hover:scale-[1.02] active:scale-[0.99] transition duration-200"
            >
              {/* Badge Sfera Biru di Sudut Kanan Atas seperti di video */}
              <div className="absolute -top-3.5 right-4 w-10 h-10 rounded-full bg-gradient-to-tr from-blue-700 via-blue-500 to-cyan-300 shadow-md shadow-blue-500/30 flex items-center justify-center text-white border-2 border-white">
                <Globe2 className="w-5 h-5" />
              </div>

              <div className="mt-1">
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  Pantauan BK
                  <br />
                  Terintegrasi
                </h3>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Layanan konseling &amp; pengaduan langsung bersama Guru BK sekolah.
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] font-semibold text-blue-600 pt-1">
                <span>Hubungi Guru BK</span>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </motion.div>

            {/* KARTU 2 (Tingkat Kedisiplinan & Kepatuhan Tata Tertib) */}
            <motion.div
              initial={{ y: 45, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.55, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setActiveModal("top-pelanggaran")}
              className="cursor-pointer relative glass-card-light rounded-[26px] p-5 h-[164px] flex flex-col justify-between hover:scale-[1.02] active:scale-[0.99] transition duration-200"
            >
              <div className="flex items-start justify-between">
                <span className="text-4xl sm:text-[42px] font-light tracking-tight text-white drop-shadow-sm leading-none">
                  {isLoadingStats ? (
                    <span className="opacity-70 text-2xl font-normal">--%</span>
                  ) : (
                    <>
                      {siswaTertibStats.percentage}
                      <span className="text-2xl font-normal">%</span>
                    </>
                  )}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/50 text-[10px] font-semibold text-slate-700 flex items-center gap-1 shadow-2xs">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  {isLoadingStats
                    ? "Memuat..."
                    : `${siswaTertibStats.totalSiswaTertib} Siswa Tertib`}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-900 block mb-0.5">
                  Kepatuhan Tata Tertib
                </span>
                <p className="text-[10px] text-slate-600 leading-snug">
                  Lihat pelanggaran yang paling sering terjadi di sekolah
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] font-semibold text-blue-700 pt-1 border-t border-white/40">
                <span>5 Pelanggaran Terbanyak</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modal Interaktif untuk Cek Poin, Buku Saku Digital, & Simulasi Login Role */}
      <QuickModals activeModal={activeModal} onClose={() => setActiveModal(null)} />
    </main>
  );
}
