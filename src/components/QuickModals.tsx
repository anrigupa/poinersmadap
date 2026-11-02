"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ShieldCheck, AlertTriangle, Award, Lock, UserCheck, BookOpen, ArrowRight } from "lucide-react";
import { MOCK_STUDENTS, RULES_DATA, StudentRecord } from "@/data/mockRules";

interface ModalProps {
  activeModal: "cek-poin" | "buku-saku" | "login" | null;
  onClose: () => void;
}

export default function QuickModals({ activeModal, onClose }: ModalProps) {
  const [searchQuery, setSearchQuery] = useState("10293");
  const [selectedRole, setSelectedRole] = useState<"admin" | "guru" | "siswa">("guru");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  const foundStudent: StudentRecord | undefined = MOCK_STUDENTS.find(
    (s) =>
      s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRules =
    selectedCategory === "Semua"
      ? RULES_DATA
      : RULES_DATA.filter((r) => r.kategori === selectedCategory);

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
                      Masukkan NIS atau Nama Siswa (Contoh: 10293, 10294, atau 10295)
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ketik NIS (misal: 10293) atau nama siswa..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="text-slate-400 py-1">Coba cepat:</span>
                  {MOCK_STUDENTS.map((s) => (
                    <button
                      key={s.nis}
                      onClick={() => setSearchQuery(s.nis)}
                      className="px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition"
                    >
                      {s.nis} - {s.nama}
                    </button>
                  ))}
                </div>

                {foundStudent ? (
                  <div className="mt-6 space-y-4">
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-xs uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
                          NIS: {foundStudent.nis} • {foundStudent.kelas}
                        </span>
                        <h4 className="text-2xl font-bold mt-2">{foundStudent.nama}</h4>
                        <p className="text-xs text-blue-100 mt-0.5">Status: {foundStudent.status}</p>
                      </div>
                      <div className="text-left sm:text-right bg-white/15 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
                        <span className="text-xs text-blue-100 block">Skor Akhir Kedisiplinan</span>
                        <span className="text-4xl font-extrabold">
                          {foundStudent.poinAwal + foundStudent.totalPelanggaran + foundStudent.poinPenghargaan}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-xs text-slate-500 block">Poin Awal</span>
                        <span className="text-lg font-bold text-slate-800">{foundStudent.poinAwal}</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100">
                        <span className="text-xs text-rose-600 block">Pelanggaran</span>
                        <span className="text-lg font-bold text-rose-700">{foundStudent.totalPelanggaran}</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                        <span className="text-xs text-emerald-600 block">Penghargaan</span>
                        <span className="text-lg font-bold text-emerald-700">+{foundStudent.poinPenghargaan}</span>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Riwayat Catatan Terbaru
                      </h5>
                      <div className="space-y-2">
                        {foundStudent.riwayat.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-sm"
                          >
                            <div className="flex items-center gap-3">
                              {item.poin > 0 ? (
                                <Award className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                              ) : (
                                <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                              )}
                              <div>
                                <p className="font-medium text-slate-800">{item.kejadian}</p>
                                <p className="text-xs text-slate-400">
                                  {item.tanggal} • Dicatat oleh {item.pencatat}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`font-bold px-2.5 py-1 rounded-full text-xs ${
                                item.poin > 0
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {item.poin > 0 ? `+${item.poin}` : item.poin} Poin
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 p-8 text-center rounded-2xl bg-slate-50 text-slate-500 text-sm">
                    Data siswa tidak ditemukan. Coba ketik NIS <b>10293</b>.
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
                      Daftar pedoman poin pelanggaran dan penghargaan prestasi siswa
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {["Semua", "Ringan", "Sedang", "Berat", "Penghargaan"].map((kat) => (
                    <button
                      key={kat}
                      onClick={() => setSelectedCategory(kat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                        selectedCategory === kat
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {kat}
                    </button>
                  ))}
                </div>

                <div className="space-y-2.5">
                  {filteredRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70"
                    >
                      <div className="pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                            {rule.kode}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            Kategori {rule.kategori}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-800 mt-1">{rule.deskripsi}</p>
                      </div>
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${
                          rule.poin > 0
                            ? "bg-emerald-100 text-emerald-700"
                            : rule.poin <= -50
                            ? "bg-rose-200 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {rule.poin > 0 ? `+${rule.poin}` : rule.poin} Poin
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MODAL 3: PORTAL LOGIN MULTI-ROLE (PERSIAPAN TAHAP BERIKUTNYA: DASHBOARD ADMIN, GURU, SISWA) */}
            {activeModal === "login" && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Portal Akses SI-DISIPLIN</h3>
                    <p className="text-xs text-slate-500">
                      Pilih peran akses untuk masuk ke Dashboard Admin, Guru/BK, atau Siswa
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 my-4">
                  {[
                    { id: "admin", label: "Admin / Tatib", desc: "Kelola master aturan & user" },
                    { id: "guru", label: "Guru / BK", desc: "Input poin & tindak lanjut" },
                    { id: "siswa", label: "Siswa / Ortu", desc: "Pantau skor & banding" },
                  ].map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id as "admin" | "guru" | "siswa")}
                      className={`p-3 rounded-2xl border text-left transition ${
                        selectedRole === role.id
                          ? "border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <UserCheck
                        className={`w-5 h-5 mb-1.5 ${
                          selectedRole === role.id ? "text-blue-600" : "text-slate-400"
                        }`}
                      />
                      <div className="text-xs font-bold text-slate-900">{role.label}</div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{role.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="space-y-3 mt-4">
                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-800">
                    Sistem otentikasi SMADAP POINER mendukung multi-peran (Admin, Guru, Siswa). Anda dapat langsung membuka halaman Login resmi di bawah ini:
                  </div>

                  <a
                    href="/login"
                    className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition text-center"
                  >
                    <span>Buka Halaman Login Resmi</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
