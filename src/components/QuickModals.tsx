"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  ShieldCheck,
  AlertTriangle,
  Award,
  BookOpen,
  ArrowRight,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Headset,
  Flame,
  TrendingUp,
  Loader2,
  Inbox,
} from "lucide-react";
import {
  searchStudentPublicAction,
  PublicStudentSearchResult,
} from "@/features/students/actions";
import {
  getCategoriesAction,
  getViolationsAction,
} from "@/features/rules/actions";
import { ViolationCategory, ViolationItem } from "@/features/rules/types";
import { PublicCounselorContact } from "@/features/teachers/types";
import { getCounselorTeachersAction } from "@/features/teachers/actions";
import { TopViolationItem } from "@/features/violations/types";
import { getTopViolationsAction } from "@/features/violations/actions";
import { createClient } from "@/lib/supabase/client";
import {
  generateWhatsAppLink,
  generateCallLink,
  formatPhoneDisplay,
} from "@/features/teachers/utils/contactLinks";

interface ModalProps {
  activeModal: "cek-poin" | "buku-saku" | "lapor-bk" | "top-pelanggaran" | null;
  onClose: () => void;
}

function getInitials(name: string): string {
  const clean = name.replace(/[,].*$/, "").trim();
  const parts = clean.split(/\s+/).filter((p) => !p.includes("."));
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export default function QuickModals({ activeModal, onClose }: ModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedStudent, setSearchedStudent] = useState<PublicStudentSearchResult | null>(null);
  const [isSearchingStudent, setIsSearchingStudent] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [catalogCategories, setCatalogCategories] = useState<ViolationCategory[]>([]);
  const [catalogRules, setCatalogRules] = useState<ViolationItem[]>([]);
  const [isLoadingRules, setIsLoadingRules] = useState<boolean>(false);

  const [bkTeachers, setBkTeachers] = useState<PublicCounselorContact[]>([]);
  const [isLoadingBk, setIsLoadingBk] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch Counselor teachers on modal open
  useEffect(() => {
    if (activeModal !== "lapor-bk") return;
    let isMounted = true;
    setIsLoadingBk(true);

    getCounselorTeachersAction()
      .then((items) => {
        if (!isMounted) return;
        setBkTeachers(items);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingBk(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeModal]);

  // Fetch real violation rules & categories on Buku Saku modal open
  useEffect(() => {
    if (activeModal !== "buku-saku") return;
    let isMounted = true;
    setIsLoadingRules(true);

    Promise.all([
      getCategoriesAction(),
      getViolationsAction({ pageSize: 150, sortBy: "code", sortOrder: "asc" }),
    ])
      .then(([cats, violationsRes]) => {
        if (!isMounted) return;
        setCatalogCategories(cats);
        setCatalogRules(violationsRes.items);
      })
      .catch((err) => {
        console.warn("Gagal memuat aturan tata tertib:", err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingRules(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeModal]);

  const [topViolations, setTopViolations] = useState<TopViolationItem[]>([]);
  const [isLoadingTopViolations, setIsLoadingTopViolations] = useState<boolean>(false);

  useEffect(() => {
    if (activeModal !== "top-pelanggaran") return;
    let isMounted = true;
    setIsLoadingTopViolations(true);

    const fetchTop = async () => {
      try {
        const items = await getTopViolationsAction();
        if (isMounted) {
          setTopViolations(items);
          setIsLoadingTopViolations(false);
        }
      } catch (err) {
        console.warn("Gagal memuat top pelanggaran:", err);
        if (isMounted) {
          setIsLoadingTopViolations(false);
        }
      }
    };

    fetchTop();

    // Supabase Realtime Listener to refresh top violations whenever student_violations change
    const supabase = createClient();
    const channel = supabase
      .channel("top-violations-realtime-modal")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "student_violations" },
        () => {
          fetchTop();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [activeModal]);

  const handleCopyPhone = (id: string, phone: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(phone);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 2000);
    }
  };

  const handleSearchStudent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = searchQuery.trim();
    if (!clean) return;

    setIsSearchingStudent(true);
    setHasSearched(true);
    try {
      const result = await searchStudentPublicAction(clean);
      setSearchedStudent(result);
    } catch (err) {
      console.warn("Pencarian siswa gagal:", err);
      setSearchedStudent(null);
    } finally {
      setIsSearchingStudent(false);
    }
  };

  const filteredRules =
    selectedCategory === "Semua"
      ? catalogRules
      : catalogRules.filter(
          (r) =>
            r.categoryName?.toLowerCase() === selectedCategory.toLowerCase()
        );

  return (
    <AnimatePresence>
      {activeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-3xl bg-white/90 backdrop-blur-2xl border border-white shadow-2xl p-6 sm:p-8 text-slate-800 max-h-[88vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* MODAL 1: CEK POIN SISWA */}
            {activeModal === "cek-poin" && (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Cek Poin Kedisiplinan Siswa</h3>
                    <p className="text-xs text-slate-500">
                      Pencarian data resmi siswa SMAN 2 Pangkep berdasarkan NIS, NISN, atau Nama
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSearchStudent} className="mt-4 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ketik NIS, NISN, atau Nama Siswa..."
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearchingStudent || !searchQuery.trim()}
                    className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    {isSearchingStudent ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Cari</span>
                    )}
                  </button>
                </form>

                {isSearchingStudent ? (
                  <div className="mt-6 p-6 rounded-2xl bg-slate-50 border border-slate-200/80 animate-pulse space-y-4">
                    <div className="h-16 bg-slate-200 rounded-xl" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-14 bg-slate-200 rounded-xl" />
                      <div className="h-14 bg-slate-200 rounded-xl" />
                    </div>
                  </div>
                ) : searchedStudent ? (
                  <div className="mt-6 space-y-4">
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-xs uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
                          NIS: {searchedStudent.nis} • {searchedStudent.className}
                        </span>
                        <h4 className="text-2xl font-bold mt-2">{searchedStudent.fullName}</h4>
                        <p className="text-xs text-blue-100 mt-0.5">
                          Status Disiplin: <span className="font-semibold">{searchedStudent.status}</span>
                        </p>
                      </div>
                      <div className="text-left sm:text-right bg-white/15 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
                        <span className="text-xs text-blue-100 block">Total Poin Pelanggaran</span>
                        <span className="text-4xl font-extrabold">
                          {searchedStudent.totalViolationPoints}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100">
                        <span className="text-xs text-rose-600 block">Akumulasi Poin Pelanggaran</span>
                        <span className="text-xl font-bold text-rose-700">
                          {searchedStudent.totalViolationPoints} Poin
                        </span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                        <span className="text-xs text-emerald-600 block">Poin Apresiasi Prestasi</span>
                        <span className="text-xl font-bold text-emerald-700">
                          +{searchedStudent.totalMeritPoints} Poin
                        </span>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Riwayat Catatan Pelanggaran
                      </h5>
                      {searchedStudent.recentViolations.length === 0 ? (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-center text-xs text-slate-500">
                          Tidak ada catatan pelanggaran aktif. Siswa berstatus tertib dan patuh.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {searchedStudent.recentViolations.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-sm"
                            >
                              <div className="flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                                <div>
                                  <p className="font-medium text-slate-800">{item.violationName}</p>
                                  <p className="text-xs text-slate-400">
                                    {item.incidentDate} • Dicatat oleh {item.reportedBy}
                                  </p>
                                </div>
                              </div>
                              <span className="font-bold px-2.5 py-1 rounded-full text-xs bg-rose-100 text-rose-700">
                                +{item.points} Poin
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : hasSearched ? (
                  <div className="mt-6 p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-400">
                      <Search className="w-5 h-5" />
                    </div>
                    <p className="font-semibold text-slate-700">Data Siswa Tidak Ditemukan</p>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Pastikan NIS, NISN, atau Nama Siswa yang Anda masukkan sudah terdaftar di pangkalan data SMAN 2 Pangkep.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 p-8 text-center rounded-2xl bg-slate-50/80 border border-dashed border-slate-200 text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                    <Search className="w-6 h-6 text-slate-300" />
                    <p>Masukkan kata kunci pencarian di atas untuk memeriksa poin kedisiplinan siswa.</p>
                  </div>
                )}
              </div>
            )}

            {/* MODAL 2: BUKU SAKU DIGITAL */}
            {activeModal === "buku-saku" && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Buku Saku Digital Tata Tertib</h3>
                    <p className="text-xs text-slate-500">
                      Pedoman klasifikasi aturan pelanggaran dan bobot poin resmi SMAN 2 Pangkep
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {["Semua", "Ringan", "Sedang", "Berat"].map((kat) => (
                    <button
                      key={kat}
                      onClick={() => setSelectedCategory(kat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                        selectedCategory === kat
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {kat}
                    </button>
                  ))}
                </div>

                {isLoadingRules && catalogRules.length === 0 ? (
                  <div className="space-y-2.5">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 animate-pulse flex items-center justify-between"
                      >
                        <div className="space-y-2 flex-1 pr-4">
                          <div className="h-4 w-48 bg-slate-200 rounded" />
                          <div className="h-3 w-32 bg-slate-200 rounded" />
                        </div>
                        <div className="h-6 w-16 bg-slate-200 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : filteredRules.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                    <Inbox className="w-6 h-6 text-slate-400" />
                    <p className="font-semibold text-slate-700">Belum Ada Aturan Dikonfigurasi</p>
                    <p className="text-slate-400">
                      Aturan tata tertib untuk kategori ini belum tersedia dalam pangkalan data.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                    {filteredRules.map((rule) => {
                      const isBerat = rule.categoryName === "Berat";
                      const isSedang = rule.categoryName === "Sedang";
                      return (
                        <div
                          key={rule.id}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:bg-white hover:border-blue-200 hover:shadow-xs transition"
                        >
                          <div className="pr-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                                {rule.code}
                              </span>
                              <span className="text-xs font-medium text-slate-500">
                                Kategori {rule.categoryName || "Umum"}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-slate-800 mt-1">{rule.name}</p>
                          </div>
                          <span
                            className={`text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${
                              isBerat
                                ? "bg-rose-100 text-rose-800"
                                : isSedang
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            +{rule.points} Poin
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* MODAL 3: LAPOR BK (DAFTAR KONTAK LANGSUNG GURU BK TANPA LOGIN) */}
            {activeModal === "lapor-bk" && (
              <div>
                <div className="flex items-center gap-3 mb-4 pr-10">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
                    <Headset className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Layanan Lapor &amp; Konseling BK</h3>
                    <p className="text-xs text-slate-500">
                      Daftar Guru Bimbingan &amp; Konseling (BK) yang siap dihubungi langsung tanpa login
                    </p>
                  </div>
                </div>

                {/* Info Privasi & Jam Layanan */}
                <div className="mb-5 p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-blue-900">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>
                      <strong>Privasi Terjamin:</strong> Laporan dan konsultasi siswa maupun orang tua bersifat rahasia.
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-[11px] font-semibold text-blue-700 border border-blue-100 self-start sm:self-auto flex-shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Aktif • Senin – Jumat
                  </span>
                </div>

                {/* Daftar Guru BK (Diambil otomatis dari database guru: teacher_type = counselor) */}
                {isLoadingBk && bkTeachers.length === 0 ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((sk) => (
                      <div
                        key={sk}
                        className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/70 animate-pulse flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-slate-200" />
                          <div className="space-y-2">
                            <div className="h-4 w-40 bg-slate-200 rounded" />
                            <div className="h-3 w-28 bg-slate-200 rounded" />
                          </div>
                        </div>
                        <div className="h-9 w-24 bg-slate-200 rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : bkTeachers.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 text-center text-xs text-slate-500">
                    Belum ada data Guru BK (<code className="font-mono text-slate-700">teacher_type = counselor</code>) yang aktif saat ini.
                  </div>
                ) : (
                <div className="space-y-3">
                  {bkTeachers.map((teacher, idx) => {
                    const gradients = [
                      "from-blue-600 to-indigo-600",
                      "from-emerald-600 to-teal-500",
                      "from-violet-600 to-purple-500",
                    ];
                    const avatarGradient = gradients[idx % gradients.length];
                    const isCopied = copiedId === teacher.id;
                    const phone = teacher.phoneNumber || "";

                    return (
                      <div
                        key={teacher.id}
                        className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 hover:bg-white border border-slate-200/80 hover:border-blue-200 hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        {/* Info Guru BK */}
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div className="relative flex-shrink-0">
                            <div
                              className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${avatarGradient} text-white font-bold text-sm flex items-center justify-center shadow-sm`}
                            >
                              {getInitials(teacher.fullName)}
                            </div>
                            <span
                              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white"
                              title="Siap Dihubungi"
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                                {teacher.fullName}
                              </h4>
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100/90 text-blue-700 border border-blue-200/60">
                                Guru BK
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 mt-0.5">
                              {teacher.assignedClass || "Bimbingan & Konseling Siswa"}
                            </p>

                            {/* Nomor HP + Tombol Salin */}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200/90 text-xs font-mono font-semibold text-slate-700">
                                <Phone className="w-3.5 h-3.5 text-blue-600" />
                                <span>{phone ? formatPhoneDisplay(phone) : "Nomor HP belum diatur"}</span>
                              </div>

                              {phone && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyPhone(teacher.id, phone)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition"
                                  title="Salin Nomor HP"
                                >
                                  {isCopied ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      <span className="text-emerald-600 font-semibold">Tersalin</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Salin</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Tombol Call & WhatsApp (Mobile-Friendly 2-Column Grid on Small Screens) */}
                        {phone && (
                          <div className="grid grid-cols-2 sm:flex items-center gap-2.5 w-full sm:w-auto sm:flex-shrink-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                            <a
                              href={generateCallLink(phone)}
                              aria-label={`Telepon ${teacher.fullName}`}
                              className="min-h-[42px] px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 border border-slate-200/90 text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-2xs transition active:scale-95"
                            >
                              <Phone className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                              <span>Call</span>
                            </a>

                            <a
                              href={generateWhatsAppLink(phone, teacher.fullName)}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`WhatsApp ${teacher.fullName}`}
                              className="min-h-[42px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition hover:scale-[1.02] active:scale-95"
                            >
                              <MessageCircle className="w-4 h-4 flex-shrink-0" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                )}
              </div>
            )}

            {/* MODAL 4: TOP 5 PELANGGARAN PALING SERING TERJADI */}
            {activeModal === "top-pelanggaran" && (
              <div>
                <div className="flex items-center gap-3 mb-4 pr-10">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20 flex-shrink-0">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">5 Pelanggaran yang Paling Sering Terjadi</h3>
                    <p className="text-xs text-slate-500">
                      Statistik frekuensi pelanggaran tata tertib sekolah dengan kejadian terbanyak berdasarkan data riil
                    </p>
                  </div>
                </div>

                {/* Info Bar Real-time */}
                <div className="mb-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <span>
                      Diurutkan berdasarkan <strong>akumulasi kejadian terbanyak</strong> secara dinamis.
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-[11px] font-semibold text-emerald-700 border border-emerald-200 shadow-2xs self-start sm:self-auto flex-shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Supabase Realtime
                  </span>
                </div>

                {/* Loading State */}
                {isLoadingTopViolations && topViolations.length === 0 ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((sk) => (
                      <div
                        key={sk}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 animate-pulse flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 w-full">
                          <div className="w-8 h-8 rounded-xl bg-slate-200 flex-shrink-0" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 w-48 bg-slate-200 rounded" />
                            <div className="h-3 w-28 bg-slate-200 rounded" />
                          </div>
                        </div>
                        <div className="h-7 w-20 bg-slate-200 rounded-full flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : topViolations.length === 0 ? (
                  /* Empty State */
                  <div className="p-8 sm:p-10 rounded-2xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center justify-center gap-2.5">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">Belum Ada Data Pelanggaran</h4>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Belum ada catatan pelanggaran yang tercatat dalam sistem untuk periode ini. Seluruh siswa tertib mematuhi tata tertib sekolah.
                    </p>
                  </div>
                ) : (
                  /* Ranking List State */
                  <div className="space-y-2.5">
                    {topViolations.map((item) => {
                      const maxCount = Math.max(...topViolations.map((v) => v.count), 1);
                      const percentage = Math.round((item.count / maxCount) * 100);

                      const rankBadges = [
                        "bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-sm shadow-amber-500/30",
                        "bg-gradient-to-tr from-slate-400 to-slate-500 text-white shadow-sm shadow-slate-400/20",
                        "bg-gradient-to-tr from-amber-700 to-amber-800 text-white shadow-sm shadow-amber-700/20",
                        "bg-slate-100 text-slate-700 border border-slate-200",
                        "bg-slate-100 text-slate-700 border border-slate-200",
                      ];
                      const rankBadgeStyle = rankBadges[item.ranking - 1] || rankBadges[3];

                      return (
                        <div
                          key={item.violationId || item.ranking}
                          className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/90 hover:bg-white border border-slate-200/80 hover:border-blue-200 hover:shadow-md transition relative overflow-hidden group"
                        >
                          {/* Visual progress bar fill */}
                          <div
                            className="absolute left-0 bottom-0 top-0 bg-blue-100/40 group-hover:bg-blue-100/60 transition-all duration-500 -z-0 pointer-events-none rounded-2xl"
                            style={{ width: `${percentage}%` }}
                          />

                          <div className="relative z-10 flex items-center justify-between gap-3">
                            {/* Ranking & Nama Pelanggaran */}
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center flex-shrink-0 ${rankBadgeStyle}`}
                              >
                                #{item.ranking}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                  {item.violationName}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                                  {item.categoryName && (
                                    <span className="text-slate-600 font-medium">{item.categoryName}</span>
                                  )}
                                  {item.code && (
                                    <>
                                      <span>•</span>
                                      <span className="font-mono text-slate-400 font-semibold">{item.code}</span>
                                    </>
                                  )}
                                  {item.points && (
                                    <>
                                      <span>•</span>
                                      <span className="text-rose-600 font-medium">+{item.points} Poin</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Jumlah Kejadian (Contoh: 125 kali) */}
                            <div className="flex-shrink-0 flex items-center gap-2">
                              <span className="px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 font-bold text-xs sm:text-sm shadow-2xs whitespace-nowrap">
                                {item.count} kali
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Modal Footer Note */}
                <div className="mt-5 pt-3.5 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Sinkronisasi data otomatis dari sistem ketertiban SMADAP POINER</span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
