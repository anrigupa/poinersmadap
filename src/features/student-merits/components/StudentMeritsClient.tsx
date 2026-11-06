"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Award,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Clock,
  XCircle,
  PlusCircle,
  Sparkles,
  TrendingDown,
  ExternalLink,
  ChevronRight,
  Info,
  Scale,
  Check,
  X,
  FileCheck,
} from "lucide-react";
import {
  StudentMeritsDashboardData,
  AchievementCategory,
} from "@/features/student-merits/types";
import {
  submitAchievementAction,
  applyMeritReductionAction,
} from "@/features/student-merits/actions";
import SectionHeader from "@/components/ui/SectionHeader";
import StatCard from "@/components/ui/StatCard";
import Badge, { BadgeVariant } from "@/components/ui/Badge";
import { typography, cards, badges, tables, spacing } from "@/lib/design-system";

interface StudentMeritsClientProps {
  data: StudentMeritsDashboardData;
}

// Strict 5-family semantic mapping for achievement categories (No arbitrary pink/purple)
const CATEGORY_BADGE_VARIANTS: Record<AchievementCategory, BadgeVariant> = {
  Akademik: "info",
  Ekstrakurikuler: "neutral",
  Tahfidz: "success",
  OSIS: "info",
  Paskibra: "warning",
  Keagamaan: "success",
  Sosial: "info",
};

export default function StudentMeritsClient({ data }: StudentMeritsClientProps) {
  const { student, achievements, meritBalance, reductions, disciplineStatus } = data;

  // Filter state for achievements
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");

  // Form submission state (Pengajuan Prestasi)
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [formData, setFormData] = useState({
    achievementName: "",
    category: "Akademik" as AchievementCategory,
    description: "",
    evidenceUrl: "",
  });
  const [formFeedback, setFormFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Conversion modal state (Merit -> Pemutihan)
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertPoints, setConvertPoints] = useState<number>(
    Math.min(meritBalance.availableMeritPoints, disciplineStatus.effectiveDisciplinePoints, 10) || 5
  );
  const [convertReason, setConvertReason] = useState("");
  const [isConverting, startConvertTransition] = useTransition();
  const [convertFeedback, setConvertFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const filteredAchievements = achievements.filter((item) => {
    if (statusFilter === "all") return true;
    return item.status === statusFilter;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback({ type: null, message: "" });

    startSubmitTransition(async () => {
      const res = await submitAchievementAction(formData);
      if (res.success) {
        setFormFeedback({ type: "success", message: res.message });
        setFormData({
          achievementName: "",
          category: "Akademik",
          description: "",
          evidenceUrl: "",
        });
      } else {
        setFormFeedback({ type: "error", message: res.message });
      }
    });
  };

  const handleConvertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConvertFeedback({ type: null, message: "" });

    startConvertTransition(async () => {
      const res = await applyMeritReductionAction({
        pointsToConvert: Number(convertPoints),
        reason: convertReason || "Konversi Saldo Prestasi Siswa",
      });

      if (res.success) {
        setConvertFeedback({ type: "success", message: res.message });
        setTimeout(() => {
          setIsConvertModalOpen(false);
          setConvertFeedback({ type: null, message: "" });
        }, 1500);
      } else {
        setConvertFeedback({ type: "error", message: res.message });
      }
    });
  };

  const disciplineBadgeVariant: BadgeVariant =
    disciplineStatus.levelColor === "emerald"
      ? "success"
      : disciplineStatus.levelColor === "amber"
      ? "warning"
      : "danger";

  return (
    <div className={spacing.sectionSpacing}>
      {/* ==================================================================== */}
      {/* HERO BANNER & STUDENT BADGE (HIGH CONTRAST & ACCESSIBLE) */}
      {/* ==================================================================== */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900 p-6 md:p-8 text-white shadow-md border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900 text-blue-100 border border-blue-500/80 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>Restorative Justice &amp; Merit Recognition</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Prestasi &amp; Pemutihan Poin Siswa
            </h1>
            <p className="text-sm text-slate-200 font-medium leading-relaxed">
              Catat prestasi akademik, ekstrakurikuler, dan budi pekerti Anda.
              Poin prestasi dapat dikonversi menjadi pemutihan poin pelanggaran secara transparan dan akuntabel.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Solid Profile Card (Anti-Glassmorphism standard) */}
            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 shadow-xs space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                Kartu Peserta Didik
              </div>
              <div className="text-base font-extrabold text-white tracking-tight">
                {student.fullName}
              </div>
              <div className="text-xs text-slate-300 font-mono font-medium">
                NIS: {student.nis} • Kelas: {student.className}
              </div>
            </div>

            <a
              href="#pengajuan-prestasi"
              className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-2 text-center"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ajukan Prestasi</span>
            </a>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SALDO PRESTASI & STATUS DISIPLIN (RESPONSIVE GRID) */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* SALDO PRESTASI (5 COLS) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <SectionHeader
              title="Saldo Prestasi"
              description="Akumulasi poin penghargaan prestasi siswa"
              icon={Award}
              badge={
                <Badge variant="success" size="sm">
                  Aktif
                </Badge>
              }
            />

            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 my-2">
              <StatCard
                value={meritBalance.totalMeritPoints}
                label="Total Diperoleh"
                description="Poin Prestasi"
                badgeText="Akumulasi"
                badgeVariant="info"
              />
              <StatCard
                value={meritBalance.usedMeritPoints}
                label="Poin Terpakai"
                description="Diputihkan"
                badgeText="Terpakai"
                badgeVariant="warning"
              />
              <StatCard
                value={meritBalance.availableMeritPoints}
                label="Saldo Tersedia"
                description="Siap Konversi"
                badgeText="Aktif"
                badgeVariant="success"
              />
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className={typography.metadataMuted}>
              Gunakan saldo prestasi untuk memutihkan poin pelanggaran Anda.
            </p>

            <button
              onClick={() => setIsConvertModalOpen(true)}
              disabled={meritBalance.availableMeritPoints <= 0 || disciplineStatus.effectiveDisciplinePoints <= 0}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs transition shrink-0 flex items-center justify-center gap-1.5 shadow-xs"
            >
              <TrendingDown className="w-4 h-4" />
              <span>Konversi Pemutihan</span>
            </button>
          </div>
        </div>

        {/* STATUS DISIPLIN (7 COLS) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <SectionHeader
              title="Status Disiplin"
              description="Perhitungan poin efektif & kepatuhan tata tertib"
              icon={Scale}
              badge={
                <Badge variant={disciplineBadgeVariant} size="sm">
                  Status: {disciplineStatus.statusLevel}
                </Badge>
              }
            />

            {/* Formula Display Banner */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/90 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Formula Kedisiplinan:</span>
                <span className="font-mono text-slate-500 text-[11px]">
                  Effective = Total Violations - Reductions
                </span>
              </div>

              <div className="grid grid-cols-5 items-center text-center gap-2">
                <div className="col-span-1 bg-white rounded-xl p-3 border border-slate-200 shadow-2xs">
                  <div className="text-xs font-semibold text-slate-600">Pelanggaran</div>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono mt-1">
                    {disciplineStatus.totalViolationPoints}
                  </div>
                </div>

                <div className="text-slate-400 font-black text-xl select-none">−</div>

                <div className="col-span-1 bg-white rounded-xl p-3 border border-slate-200 shadow-2xs">
                  <div className="text-xs font-semibold text-slate-600">Pemutihan</div>
                  <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-mono mt-1">
                    {disciplineStatus.totalReductionPoints}
                  </div>
                </div>

                <div className="text-slate-400 font-black text-xl select-none">=</div>

                <div className="col-span-1 bg-white rounded-xl p-3 border border-blue-200 shadow-2xs">
                  <div className="text-xs font-bold text-blue-900">Poin Efektif</div>
                  <div className="text-xl sm:text-2xl font-black text-blue-700 font-mono mt-1">
                    {disciplineStatus.effectiveDisciplinePoints}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Skala Batas Sanksi (Maks 200 Poin)</span>
                <span className="font-mono">{disciplineStatus.effectiveDisciplinePoints} / 200 Poin</span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    disciplineStatus.levelColor === "emerald"
                      ? "bg-emerald-600"
                      : disciplineStatus.levelColor === "amber"
                      ? "bg-amber-500"
                      : disciplineStatus.levelColor === "orange"
                      ? "bg-amber-600"
                      : "bg-rose-600"
                  }`}
                  style={{ width: `${Math.min(disciplineStatus.progressBarPercent, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Otoritas Sanksi: <strong className="text-slate-800">{disciplineStatus.sanctionAuthority}</strong></span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              *Riwayat pelanggaran asli tetap tersimpan permanen
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* PRESTASI SAYA (DATA TABLE & HIGH CONTRAST) */}
      {/* ==================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-6">
        <SectionHeader
          title="Prestasi Saya"
          description="Daftar seluruh capaian kejuaraan, organisasi, dan pengabdian yang tercatat"
          icon={Award}
          badge={
            <Badge variant="info" size="sm">
              {achievements.length} Terdaftar
            </Badge>
          }
          action={
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/60 text-xs font-semibold">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  statusFilter === "all"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setStatusFilter("approved")}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  statusFilter === "approved"
                    ? "bg-white text-emerald-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Disetujui</span>
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  statusFilter === "pending"
                    ? "bg-white text-amber-950 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>Menunggu</span>
              </button>
              <button
                onClick={() => setStatusFilter("rejected")}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  statusFilter === "rejected"
                    ? "bg-white text-rose-950 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <XCircle className="w-3.5 h-3.5 text-rose-700" />
                <span>Ditolak</span>
              </button>
            </div>
          }
        />

        {filteredAchievements.length === 0 ? (
          <div className="p-10 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 space-y-2">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-800">
              Tidak ada data prestasi {statusFilter !== "all" ? `dengan status "${statusFilter}"` : ""}
            </div>
            <p className={typography.metadataMuted}>
              Belum ada data prestasi yang terdaftar. Ajukan prestasi baru melalui formulir di bawah.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className={tables.table}>
              <thead className={tables.thead}>
                <tr>
                  <th className={tables.th}>Nama Prestasi</th>
                  <th className={tables.th}>Kategori</th>
                  <th className={tables.th}>Tanggal Diajukan</th>
                  <th className={`${tables.th} text-center`}>Poin Merit</th>
                  <th className={`${tables.th} text-center`}>Status Verifikasi</th>
                  <th className={tables.thRight}>Bukti Pendukung</th>
                </tr>
              </thead>
              <tbody className={tables.tbody}>
                {filteredAchievements.map((item) => (
                  <tr key={item.id} className={tables.row}>
                    <td className={`${tables.td} font-medium max-w-xs`}>
                      <div className="font-bold text-slate-900">{item.achievementName}</div>
                      <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {item.description}
                      </div>
                    </td>
                    <td className={tables.td}>
                      <Badge variant={CATEGORY_BADGE_VARIANTS[item.category] || "neutral"} size="sm">
                        {item.category}
                      </Badge>
                    </td>
                    <td className={`${tables.td} font-mono text-slate-600 whitespace-nowrap`}>
                      {item.formattedDate}
                    </td>
                    <td className={`${tables.td} text-center font-mono font-bold`}>
                      {item.status === "approved" ? (
                        <span className="text-emerald-700 font-extrabold">+{item.meritPoints}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className={`${tables.td} text-center`}>
                      {item.status === "approved" && (
                        <Badge variant="success" size="sm" icon={CheckCircle2}>
                          Disetujui
                        </Badge>
                      )}
                      {item.status === "pending" && (
                        <Badge variant="warning" size="sm" icon={Clock}>
                          Pending (Guru BK)
                        </Badge>
                      )}
                      {item.status === "rejected" && (
                        <Badge variant="danger" size="sm" icon={XCircle}>
                          Ditolak
                        </Badge>
                      )}
                    </td>
                    <td className={tables.tdRight}>
                      {item.evidenceUrl ? (
                        <a
                          href={item.evidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition border border-slate-200"
                        >
                          <span>Lihat Bukti</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">Tidak ada berkas</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* RIWAYAT PEMUTIHAN (AUDIT TRAIL TABLE) */}
      {/* ==================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-6">
        <SectionHeader
          title="Riwayat Pemutihan"
          description="Rekam jejak pengurangan poin kedisiplinan yang terverifikasi dan permanen"
          icon={TrendingDown}
          badge={
            <Badge variant="success" size="sm">
              Audit Trail Resmi
            </Badge>
          }
          action={
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Riwayat pelanggaran asli tetap diarsipkan</span>
            </div>
          }
        />

        {reductions.length === 0 ? (
          <div className="p-10 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 space-y-2">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-800">Belum ada riwayat pemutihan</div>
            <p className={typography.metadataMuted}>
              Poin pelanggaran yang diputihkan melalui prestasi atau konseling akan tercantum di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className={tables.table}>
              <thead className={tables.thead}>
                <tr>
                  <th className={tables.th}>Tanggal</th>
                  <th className={tables.th}>Pelanggaran / Alasan Pemutihan</th>
                  <th className={`${tables.th} text-center`}>Poin Awal</th>
                  <th className={`${tables.th} text-center`}>Poin Pemutihan</th>
                  <th className={`${tables.th} text-center`}>Sisa Poin</th>
                  <th className={tables.thRight}>Disetujui Oleh</th>
                </tr>
              </thead>
              <tbody className={tables.tbody}>
                {reductions.map((red) => (
                  <tr key={red.id} className={tables.row}>
                    <td className={`${tables.td} font-mono text-slate-600 whitespace-nowrap`}>
                      {red.formattedDate}
                    </td>
                    <td className={`${tables.td} font-semibold text-slate-900`}>
                      {red.violationOrReason}
                    </td>
                    <td className={`${tables.td} text-center font-mono text-slate-600`}>
                      {red.originalPoints}
                    </td>
                    <td className={`${tables.td} text-center font-mono font-bold text-emerald-700`}>
                      -{red.reductionPoints}
                    </td>
                    <td className={`${tables.td} text-center font-mono font-bold text-blue-700`}>
                      {red.remainingPoints}
                    </td>
                    <td className={`${tables.tdRight} font-medium text-slate-700`}>
                      {red.approvedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* PENGAJUAN PRESTASI (STANDARDIZED FORM) */}
      {/* ==================================================================== */}
      <div
        id="pengajuan-prestasi"
        className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-6"
      >
        <SectionHeader
          title="Pengajuan Prestasi"
          description="Kirimkan sertifikat, piala, atau pengakuan prestasi untuk diverifikasi oleh Guru BK"
          icon={PlusCircle}
        />

        {formFeedback.type && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm border ${
              formFeedback.type === "success"
                ? "bg-emerald-100 text-emerald-950 border-emerald-400 font-bold"
                : "bg-rose-100 text-rose-950 border-rose-400 font-bold"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {formFeedback.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-700 shrink-0" />
              )}
              <span>{formFeedback.message}</span>
            </div>
            <button
              onClick={() => setFormFeedback({ type: null, message: "" })}
              className="text-slate-600 hover:text-slate-900 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Achievement Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Nama Prestasi / Kegiatan <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.achievementName}
                onChange={(e) => setFormData({ ...formData, achievementName: e.target.value })}
                placeholder="cth: Juara 1 Lomba Cerdas Cermat Tingkat Kabupaten"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Kategori Prestasi <span className="text-rose-600">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as AchievementCategory })
                }
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition bg-white text-slate-900"
              >
                <option value="Akademik">Akademik (Olimpiade, Sains, Debat, Karya Ilmiah)</option>
                <option value="Ekstrakurikuler">Ekstrakurikuler (Olahraga, Seni, Pramuka, PMR)</option>
                <option value="Tahfidz">Tahfidz (Hafalan Al-Qur'an / MTQ)</option>
                <option value="OSIS">OSIS (Kepengurusan &amp; Kepanitiaan)</option>
                <option value="Paskibra">Paskibra (Pengibar Bendera Sekolah / Daerah)</option>
                <option value="Keagamaan">Keagamaan (Kajian, Da'i, Rohis)</option>
                <option value="Sosial">Sosial (Bakti Lingkungan, Donor Darah, Relawan)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Deskripsi &amp; Rincian Pencapaian <span className="text-rose-600">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Jelaskan tingkatan kejuaraan, penyelenggara, peran Anda, dan hasil yang diperoleh..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition bg-white text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Supporting Evidence URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Tautan Bukti Pendukung (Sertifikat / Dokumentasi)
            </label>
            <input
              type="url"
              value={formData.evidenceUrl}
              onChange={(e) => setFormData({ ...formData, evidenceUrl: e.target.value })}
              placeholder="https://drive.google.com/file/... atau tautan berkas sertifikat"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition bg-white text-slate-900 placeholder:text-slate-400"
            />
            <p className={typography.metadataMuted}>
              Unggah file piagam ke Google Drive / cloud storage lalu lampirkan tautan publiknya di sini.
            </p>
          </div>

          {/* Verification Notice Card */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-blue-950">Ketentuan Verifikasi Prestasi:</p>
              <p className="text-blue-900 text-xs leading-relaxed">
                Setiap pengajuan baru akan berstatus <strong>Pending</strong> sampai ditinjau dan diverifikasi oleh <strong>Guru BK</strong> atau <strong>Admin Kesiswaan</strong>. Poin penghargaan akan otomatis ditambahkan ke Saldo Prestasi setelah disetujui.
              </p>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs transition shadow-xs flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mengirim Pengajuan...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Kirim Pengajuan Prestasi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ==================================================================== */}
      {/* MODAL: KONVERSI POIN PRESTASI KE PEMUTIHAN */}
      {/* ==================================================================== */}
      {isConvertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Konversi Pemutihan Poin</h3>
                  <p className="text-xs text-slate-500">Gunakan saldo prestasi Anda untuk pemutihan</p>
                </div>
              </div>
              <button
                onClick={() => setIsConvertModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {convertFeedback.type && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                  convertFeedback.type === "success"
                    ? "bg-emerald-100 text-emerald-950 border-emerald-400 font-bold"
                    : "bg-rose-100 text-rose-950 border-rose-400 font-bold"
                }`}
              >
                {convertFeedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-700 shrink-0" />
                )}
                <span>{convertFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleConvertSubmit} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Saldo Prestasi Tersedia:</span>
                  <span className="font-bold font-mono text-emerald-700 text-sm">
                    {meritBalance.availableMeritPoints} Poin
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Poin Pelanggaran Efektif:</span>
                  <span className="font-bold font-mono text-slate-900 text-sm">
                    {disciplineStatus.effectiveDisciplinePoints} Poin
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1.5 text-xs">
                  Jumlah Poin yang Dikonversi <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={Math.min(
                    meritBalance.availableMeritPoints,
                    disciplineStatus.effectiveDisciplinePoints
                  )}
                  value={convertPoints}
                  onChange={(e) => setConvertPoints(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1.5 text-xs">
                  Catatan / Keterangan Pemutihan <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={convertReason}
                  onChange={(e) => setConvertReason(e.target.value)}
                  placeholder="cth: Pemutihan poin keterlambatan melalui juara debat"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              {/* Simulation Result */}
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 space-y-1 text-xs">
                <div className="font-bold text-blue-950">Simulasi Hasil Pemutihan:</div>
                <div className="font-medium text-blue-900">
                  Poin Efektif Baru:{" "}
                  <strong className="text-blue-950 font-bold font-mono">
                    {Math.max(0, disciplineStatus.effectiveDisciplinePoints - Number(convertPoints))} Poin
                  </strong>
                </div>
                <div className="text-slate-500 text-[11px] pt-0.5">
                  *Catatan: Riwayat pelanggaran di database tetap tersimpan permanen untuk kebutuhan audit.
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConvertModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isConverting}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
                >
                  {isConverting ? "Memproses..." : "Konfirmasi Pemutihan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
