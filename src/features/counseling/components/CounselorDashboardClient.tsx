"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ArrowLeft,
  Users,
  Search,
  PlusCircle,
  FileSpreadsheet,
  HeartHandshake,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
  Award,
  MinusCircle,
  ShieldCheck,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Scale,
  FileText,
  AlertTriangle,
  ClipboardList,
  Check,
  Info,
  LayoutDashboard,
} from "lucide-react";
import {
  CounselorDashboardData,
  CounselorStudentOption,
  CoachingStudentItem,
} from "@/features/counseling/types";
import {
  getCounselorDashboardDataAction,
  recordCounselingSessionAction,
} from "@/features/counseling/actions";
import {
  verifyAchievementAction,
  applyMeritReductionAction,
  CounselorAchievementItem,
  CounselorReductionItem,
} from "@/features/student-merits/actions";
import { AchievementCategory } from "@/features/student-merits/types";

interface CounselorDashboardClientProps {
  initialData: CounselorDashboardData;
}

// High-contrast, WCAG AA compliant category badge styles
const CATEGORY_COLORS: Record<
  AchievementCategory,
  { bg: string; text: string; border: string }
> = {
  Akademik: { bg: "bg-blue-100", text: "text-blue-900", border: "border-blue-300" },
  Ekstrakurikuler: { bg: "bg-purple-100", text: "text-purple-900", border: "border-purple-300" },
  Tahfidz: { bg: "bg-emerald-100", text: "text-emerald-900", border: "border-emerald-300" },
  OSIS: { bg: "bg-indigo-100", text: "text-indigo-900", border: "border-indigo-300" },
  Paskibra: { bg: "bg-amber-100", text: "text-amber-900", border: "border-amber-300" },
  Keagamaan: { bg: "bg-teal-100", text: "text-teal-900", border: "border-teal-300" },
  Sosial: { bg: "bg-rose-100", text: "text-rose-900", border: "border-rose-300" },
};

export default function CounselorDashboardClient({
  initialData,
}: CounselorDashboardClientProps) {
  const [data, setData] = useState<CounselorDashboardData>(initialData);
  const { access, summary, achievements, reductions, coachingStudents, availableStudents } = data;

  // Active Tab: "overview" | "verifikasi" | "pemutihan" | "riwayat" | "pembinaan"
  const [activeTab, setActiveTab] = useState<"overview" | "verifikasi" | "pemutihan" | "riwayat" | "pembinaan">(
    "overview"
  );

  // General state
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Section: Filter & Verification Modal state
  const [achievementFilter, setAchievementFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [achievementSearch, setAchievementSearch] = useState("");
  const [verifyingItem, setVerifyingItem] = useState<CounselorAchievementItem | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<"approved" | "rejected">("approved");
  const [assignedMeritPoints, setAssignedMeritPoints] = useState<number>(15);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isVerifying, startVerifyTransition] = useTransition();

  // Section: Pemutihan Poin Conversion state
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    availableStudents[0]?.id || ""
  );
  const selectedStudent = availableStudents.find((s) => s.id === selectedStudentId) || availableStudents[0];
  const [pointsToConvert, setPointsToConvert] = useState<number>(10);
  const [reductionReason, setReductionReason] = useState("");
  const [isConverting, startConvertTransition] = useTransition();

  // Section: Add Coaching / Counseling Modal state
  const [isCoachingModalOpen, setIsCoachingModalOpen] = useState(false);
  const [coachingTargetStudentId, setCoachingTargetStudentId] = useState<string>("");
  const [coachingType, setCoachingType] = useState("Bimbingan Kedisiplinan");
  const [counselingNotes, setCounselingNotes] = useState("");
  const [followUpActions, setFollowUpActions] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [isSubmittingCoaching, startCoachingTransition] = useTransition();

  // Refresh entire dashboard action
  const refreshData = () => {
    startRefreshTransition(async () => {
      const refreshed = await getCounselorDashboardDataAction();
      setData(refreshed);
    });
  };

  // --------------------------------------------------------------------------
  // ACCESS CONTROL: Restricted to Counselor Only
  // --------------------------------------------------------------------------
  if (!access.isCounselor) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-300 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center mx-auto mb-5 shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Akses Dibatasi</h2>
          <p className="text-sm font-bold text-rose-800 mb-3 bg-rose-100 py-2.5 px-3.5 rounded-xl border border-rose-300">
            Akses hanya dimiliki oleh Guru BK.
          </p>
          <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6">
            Halaman ini khusus diperuntukkan bagi Guru Bimbingan Konseling (BK) untuk verifikasi prestasi,
            persetujuan pemutihan poin, dan pembinaan kedisiplinan siswa.
          </p>
          <Link
            href="/guru"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda Guru</span>
          </Link>
        </div>
      </div>
    );
  }

  // Handle Verify Action (Approve / Reject)
  const handleOpenVerifyModal = (item: CounselorAchievementItem, status: "approved" | "rejected") => {
    setVerifyingItem(item);
    setVerifyStatus(status);
    setAssignedMeritPoints(item.meritPoints > 0 ? item.meritPoints : 15);
    setRejectionReason("");
  };

  const handleConfirmVerification = () => {
    if (!verifyingItem) return;

    startVerifyTransition(async () => {
      const res = await verifyAchievementAction(
        verifyingItem.id,
        verifyStatus,
        verifyStatus === "approved" ? Number(assignedMeritPoints) : 0,
        verifyStatus === "rejected" ? rejectionReason : undefined
      );

      if (res.success) {
        setBanner({ type: "success", message: res.message });
        setVerifyingItem(null);
        refreshData();
      } else {
        setBanner({ type: "error", message: res.message });
      }
    });
  };

  // Handle Pemutihan Conversion Action
  const handleConvertMeritReduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    startConvertTransition(async () => {
      const res = await applyMeritReductionAction({
        studentId: selectedStudent.id,
        pointsToConvert: Number(pointsToConvert),
        reason: reductionReason || "Persetujuan Pemutihan Poin Prestasi oleh Guru BK",
      });

      if (res.success) {
        setBanner({ type: "success", message: res.message });
        setReductionReason("");
        refreshData();
      } else {
        setBanner({ type: "error", message: res.message });
      }
    });
  };

  // Handle Record Coaching Session
  const handleOpenCoachingModal = (studentId: string) => {
    setCoachingTargetStudentId(studentId);
    setCounselingNotes("");
    setFollowUpActions("");
    setRecommendations("");
    setIsCoachingModalOpen(true);
  };

  const handleSubmitCoaching = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachingTargetStudentId) return;

    startCoachingTransition(async () => {
      const evidenceCombined = [
        followUpActions ? `Tindak Lanjut: ${followUpActions}` : null,
        recommendations ? `Rekomendasi: ${recommendations}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      const res = await recordCounselingSessionAction({
        studentId: coachingTargetStudentId,
        counselingType: coachingType,
        description: counselingNotes,
        counselingDate: new Date().toISOString(),
        pointReduction: 0,
        evidenceNotes: evidenceCombined || undefined,
      });

      if (res.success) {
        setBanner({ type: "success", message: res.message });
        setIsCoachingModalOpen(false);
        refreshData();
      } else {
        setBanner({ type: "error", message: res.message });
      }
    });
  };

  // Filtered Achievements
  const filteredAchievements = achievements.filter((item) => {
    const matchesFilter = achievementFilter === "all" ? true : item.status === achievementFilter;
    const matchesSearch =
      achievementSearch.trim() === "" ||
      item.studentName.toLowerCase().includes(achievementSearch.toLowerCase()) ||
      item.achievementName.toLowerCase().includes(achievementSearch.toLowerCase()) ||
      item.studentNis.includes(achievementSearch);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* ==================================================================== */}
      {/* HERO BANNER & GURU BK BADGE (HIGH CONTRAST & ACCESSIBLE) */}
      {/* ==================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 md:p-8 text-white shadow-md border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-900 text-indigo-100 border border-indigo-500/80 text-xs font-bold">
              <HeartHandshake className="w-3.5 h-3.5 text-indigo-300" />
              <span>Layanan Bimbingan Konseling &amp; Restorative Discipline</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-xs">
              Portal Konseling &amp; Pembinaan (BK)
            </h1>
            <p className="text-sm text-slate-200 font-medium leading-relaxed">
              Verifikasi perolehan prestasi siswa, persetujuan pemutihan poin kedisiplinan,
              dan pendampingan siswa dalam pembinaan tata tertib sekolah.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Solid Teacher Information Card with High Contrast */}
            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 shadow-xs space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                Pendidik Bimbingan Konseling
              </div>
              <div className="text-base font-black text-white tracking-tight">
                {access.teacher?.fullName || "Guru BK"}
              </div>
              <div className="text-xs text-slate-200 font-mono font-medium">
                NIP: {access.teacher?.nip || "-"} • Mandat: Konselor
              </div>
            </div>

            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white transition flex items-center justify-center shadow-xs"
              title="Perbarui Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {banner && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in duration-200 border ${
            banner.type === "success"
              ? "bg-emerald-100 text-emerald-950 border-emerald-400 font-bold"
              : "bg-rose-100 text-rose-950 border-rose-400 font-bold"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {banner.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-700 shrink-0" />
            )}
            <span>{banner.message}</span>
          </div>
          <button
            onClick={() => setBanner(null)}
            className="text-slate-600 hover:text-slate-900 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* DASHBOARD KONSELING BK */}
      {/* ==================================================================== */}
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center border border-blue-200">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Dashboard Konseling BK
            </h2>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Pantau pengajuan prestasi, pemutihan poin, dan aktivitas pembinaan siswa.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Pengajuan Prestasi Pending */}
          <div
            onClick={() => setActiveTab("verifikasi")}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                Perlu Tinjauan
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-900 font-mono">
                {summary.totalPendingMerits}
              </div>
              <div className="text-xs font-bold text-slate-800 mt-1">
                Pengajuan Prestasi Pending
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                <span>Klik untuk verifikasi</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Card 2: Total Prestasi Disetujui */}
          <div
            onClick={() => {
              setActiveTab("verifikasi");
              setAchievementFilter("approved");
            }}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                Terverifikasi
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-900 font-mono">
                {summary.totalApprovedMerits}
              </div>
              <div className="text-xs font-bold text-slate-800 mt-1">
                Prestasi Siswa Disetujui
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                Poin penghargaan telah aktif
              </div>
            </div>
          </div>

          {/* Card 3: Total Pemutihan Disetujui */}
          <div
            onClick={() => setActiveTab("riwayat")}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-950 bg-blue-100 px-3 py-1 rounded-full border border-blue-300">
                Audit Trail
              </span>
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 border border-blue-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-900 font-mono">
                {summary.totalApprovedReductions}
              </div>
              <div className="text-xs font-bold text-slate-800 mt-1">
                Total Pemutihan Disetujui
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                Pengurangan poin terdokumentasi
              </div>
            </div>
          </div>

          {/* Card 4: Total Siswa Dalam Pembinaan */}
          <div
            onClick={() => setActiveTab("pembinaan")}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-950 bg-rose-100 px-3 py-1 rounded-full border border-rose-300">
                SP1 / SP2 / SP3
              </span>
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 border border-rose-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-900 font-mono">
                {summary.totalStudentsInCoaching}
              </div>
              <div className="text-xs font-bold text-slate-800 mt-1">
                Siswa Dalam Pembinaan
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                Monitoring kedisiplinan BK
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* NAVIGATION TABS (CLEAN, NO TECHNICAL PREFIXES) */}
      {/* ==================================================================== */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Semua Seksi</span>
        </button>

        <button
          onClick={() => setActiveTab("verifikasi")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "verifikasi"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Verifikasi Prestasi</span>
          {summary.totalPendingMerits > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-mono text-[10px] font-bold">
              {summary.totalPendingMerits}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("pemutihan")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "pemutihan"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Pemutihan Poin</span>
        </button>

        <button
          onClick={() => setActiveTab("riwayat")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "riwayat"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Riwayat Pemutihan</span>
        </button>

        <button
          onClick={() => setActiveTab("pembinaan")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "pembinaan"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Pembinaan Siswa</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* VERIFIKASI PRESTASI SISWA */}
      {/* ==================================================================== */}
      {(activeTab === "overview" || activeTab === "verifikasi") && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300">
                  <Award className="w-4 h-4" />
                </div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Verifikasi Prestasi Siswa
                </h2>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Tinjau bukti sertifikat capaian peserta didik, berikan persetujuan poin merit, atau tolak dengan alasan resmi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari siswa / nama prestasi..."
                  value={achievementSearch}
                  onChange={(e) => setAchievementSearch(e.target.value)}
                  className="text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium w-full sm:w-56"
                />
              </div>

              {/* Status tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                <button
                  onClick={() => setAchievementFilter("all")}
                  className={`px-3 py-1 rounded-xl transition ${
                    achievementFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setAchievementFilter("pending")}
                  className={`px-3 py-1 rounded-xl transition ${
                    achievementFilter === "pending" ? "bg-white text-amber-950 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setAchievementFilter("approved")}
                  className={`px-3 py-1 rounded-xl transition ${
                    achievementFilter === "approved" ? "bg-white text-emerald-950 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Disetujui
                </button>
                <button
                  onClick={() => setAchievementFilter("rejected")}
                  className={`px-3 py-1 rounded-xl transition ${
                    achievementFilter === "rejected" ? "bg-white text-rose-950 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Ditolak
                </button>
              </div>
            </div>
          </div>

          {filteredAchievements.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Award className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-800">Tidak ada pengajuan prestasi</div>
              <p className="text-xs text-slate-500 font-medium">
                {achievementFilter === "pending"
                  ? "Seluruh pengajuan prestasi telah diverifikasi."
                  : "Belum ada rekam prestasi pada filter ini."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-50/80">
                    <th className="py-3 px-4">Siswa</th>
                    <th className="py-3 px-4">Nama Prestasi &amp; Deskripsi</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4 text-center">Poin Merit</th>
                    <th className="py-3 px-4">Tanggal Pengajuan</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Aksi Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAchievements.map((item) => {
                    const catStyle = CATEGORY_COLORS[item.category] || {
                      bg: "bg-slate-100",
                      text: "text-slate-900",
                      border: "border-slate-300",
                    };

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{item.studentName}</div>
                          <div className="text-xs text-slate-600 font-mono">
                            {item.studentNis} • {item.className}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-bold text-slate-900">{item.achievementName}</div>
                          <div className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                            {item.description}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                          >
                            {item.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono font-bold">
                          {item.status === "approved" ? (
                            <span className="text-emerald-700 font-black text-sm">+{item.meritPoints}</span>
                          ) : (
                            <span className="text-slate-400 font-medium">0</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                          {item.formattedDate}
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {item.status === "approved" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 font-bold text-xs border border-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Disetujui</span>
                            </span>
                          )}
                          {item.status === "pending" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-950 font-bold text-xs border border-amber-400">
                              <Clock className="w-3.5 h-3.5 text-amber-700" />
                              <span>Pending</span>
                            </span>
                          )}
                          {item.status === "rejected" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-950 font-bold text-xs border border-rose-400">
                              <XCircle className="w-3.5 h-3.5 text-rose-700" />
                              <span>Ditolak</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.evidenceUrl && (
                              <a
                                href={item.evidenceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition inline-flex items-center gap-1 border border-slate-200"
                                title="Lihat Bukti"
                              >
                                <span>Bukti</span>
                                <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                              </a>
                            )}

                            {item.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleOpenVerifyModal(item, "approved")}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-xs"
                                >
                                  Setujui
                                </button>
                                <button
                                  onClick={() => handleOpenVerifyModal(item, "rejected")}
                                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-900 font-bold text-xs transition border border-rose-300"
                                >
                                  Tolak
                                </button>
                              </>
                            )}

                            {item.status === "approved" && (
                              <button
                                onClick={() => handleOpenVerifyModal(item, "rejected")}
                                className="text-xs font-semibold text-slate-500 hover:text-rose-700 px-2 py-1"
                              >
                                Batalkan
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* PEMUTIHAN POIN */}
      {/* ==================================================================== */}
      {(activeTab === "overview" || activeTab === "pemutihan") && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300">
                <TrendingDown className="w-4 h-4" />
              </div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Pemutihan Poin
              </h2>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Pilih peserta didik, evaluasi saldo prestasi yang tersedia, dan setujui konversi pemotongan poin disiplin secara langsung.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Student Selector & Metrics (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Pilih Peserta Didik <span className="text-rose-600">*</span>
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 bg-white font-semibold text-slate-900"
                >
                  {availableStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.className}) — Disiplin: {s.effectivePoints} | Prestasi: {s.availableMerits}
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudent && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-300 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <div className="font-black text-slate-900 text-sm">
                        {selectedStudent.fullName}
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        NIS: {selectedStudent.nis} • Kelas: {selectedStudent.className}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-950 border border-blue-300">
                      Disiplin: {selectedStudent.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-300">
                      <div className="text-xs text-slate-600 font-bold">Total Pelanggaran</div>
                      <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                        {selectedStudent.totalViolationPoints}
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-300">
                      <div className="text-xs text-slate-600 font-bold">Total Prestasi</div>
                      <div className="text-lg font-black text-blue-700 font-mono mt-0.5">
                        {selectedStudent.totalMeritPoints}
                      </div>
                    </div>
                    <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-300">
                      <div className="text-xs text-emerald-900 font-black">Saldo Tersedia</div>
                      <div className="text-lg font-black text-emerald-700 font-mono mt-0.5">
                        {selectedStudent.availableMerits}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Simulation & Approval Form (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-50 p-5 rounded-2xl border border-slate-300 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Simulasi Kalkulasi Pemutihan Poin:
                </span>
                <span className="text-xs font-mono font-medium text-slate-500">
                  Formula: Poin Akhir = Pelanggaran - Konversi
                </span>
              </div>

              {/* Simulation Result Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-300 shadow-xs grid grid-cols-5 items-center text-center gap-2">
                <div className="col-span-1">
                  <div className="text-xs text-slate-600 font-bold">Poin Pelanggaran</div>
                  <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
                    {selectedStudent?.effectivePoints ?? 0}
                  </div>
                </div>

                <div className="text-slate-500 font-black text-lg select-none">−</div>

                <div className="col-span-1">
                  <div className="text-xs text-emerald-900 font-bold">Konversi Merit</div>
                  <div className="text-xl font-black text-emerald-700 font-mono mt-0.5">
                    {Math.min(
                      Number(pointsToConvert) || 0,
                      selectedStudent?.availableMerits ?? 0,
                      selectedStudent?.effectivePoints ?? 0
                    )}
                  </div>
                </div>

                <div className="text-slate-500 font-black text-lg select-none">=</div>

                <div className="col-span-1 bg-blue-50 p-2 rounded-xl border border-blue-300">
                  <div className="text-xs text-blue-900 font-black">Setelah Pemutihan</div>
                  <div className="text-xl font-black text-blue-800 font-mono mt-0.5">
                    {Math.max(
                      0,
                      (selectedStudent?.effectivePoints ?? 0) -
                        Math.min(
                          Number(pointsToConvert) || 0,
                          selectedStudent?.availableMerits ?? 0,
                          selectedStudent?.effectivePoints ?? 0
                        )
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleConvertMeritReduction} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Jumlah Poin yang Diputihkan
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={Math.min(
                        selectedStudent?.availableMerits ?? 0,
                        selectedStudent?.effectivePoints ?? 0
                      )}
                      value={pointsToConvert}
                      onChange={(e) => setPointsToConvert(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Keterangan / Alasan Pemutihan
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="cth: Pemutihan melalui perolehan Juara Lomba Debat"
                      value={reductionReason}
                      onChange={(e) => setReductionReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-600 font-medium">
                    *Riwayat pelanggaran di database tidak akan pernah dihapus.
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isConverting ||
                      !selectedStudent ||
                      selectedStudent.availableMerits <= 0 ||
                      selectedStudent.effectivePoints <= 0
                    }
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isConverting ? "Menyimpan..." : "Setujui & Konversi Pemutihan"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* RIWAYAT PEMUTIHAN */}
      {/* ==================================================================== */}
      {(activeTab === "overview" || activeTab === "riwayat") && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center border border-blue-300">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Riwayat Pemutihan
                </h2>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Catatan rekam jejak resmi seluruh pengurangan poin kedisiplinan yang telah disetujui Guru BK atau Administrator.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 self-start sm:self-auto">
              Total: {reductions.length} Transaksi
            </span>
          </div>

          {reductions.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <ClipboardList className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-800">Belum ada riwayat pemutihan</div>
              <p className="text-xs text-slate-500 font-medium">
                Poin yang diputihkan akan tercatat otomatis di audit trail ini.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-50/80">
                    <th className="py-3 px-4">Siswa</th>
                    <th className="py-3 px-4">Alasan Pemutihan / Sumber</th>
                    <th className="py-3 px-4 text-center">Poin Awal</th>
                    <th className="py-3 px-4 text-center">Poin Pemutihan</th>
                    <th className="py-3 px-4 text-center">Sisa Poin</th>
                    <th className="py-3 px-4">Disetujui Oleh</th>
                    <th className="py-3 px-4 text-right">Tanggal Pelaksanaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reductions.map((red) => (
                    <tr key={red.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{red.studentName}</div>
                        <div className="text-xs text-slate-600 font-mono">
                          {red.studentNis} • {red.className}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {red.violationOrReason}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-600">
                        {red.originalPoints}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-black text-emerald-700 text-sm">
                        -{red.reductionPoints}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-black text-blue-800 text-sm">
                        {red.remainingPoints}
                      </td>

                      <td className="py-3.5 px-4 text-slate-800 font-semibold">
                        {red.approvedBy}
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-700 font-medium whitespace-nowrap">
                        {red.formattedDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* PEMBINAAN SISWA */}
      {/* ==================================================================== */}
      {(activeTab === "overview" || activeTab === "pembinaan") && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center border border-rose-300">
                  <Scale className="w-4 h-4" />
                </div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Pembinaan Siswa
                </h2>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Daftar peserta didik yang memerlukan pendampingan bimbingan konseling berdasarkan poin disiplin efektif aktif.
              </p>
            </div>

            <button
              onClick={() => handleOpenCoachingModal(availableStudents[0]?.id || "")}
              className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Catat Konseling Baru</span>
            </button>
          </div>

          {coachingStudents.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="text-sm font-bold text-slate-800">Tidak ada siswa berstatus SP</div>
              <p className="text-xs text-slate-500 font-medium">
                Seluruh siswa berada dalam batas kondisi tertib / berstatus Aman.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-50/80">
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4 text-center">Poin Pelanggaran</th>
                    <th className="py-3 px-4 text-center">Poin Pemutihan</th>
                    <th className="py-3 px-4 text-center">Poin Efektif</th>
                    <th className="py-3 px-4 text-center">Status Disiplin</th>
                    <th className="py-3 px-4">Catatan Terakhir / Rekomendasi</th>
                    <th className="py-3 px-4 text-right">Aksi BK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {coachingStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{s.studentName}</div>
                        <div className="text-xs text-slate-600 font-mono">{s.studentNis}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-800 font-semibold whitespace-nowrap">
                        {s.className}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700">
                        {s.totalViolationPoints}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-700">
                        {s.totalReductionPoints > 0 ? `-${s.totalReductionPoints}` : "0"}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-black text-rose-700 text-sm">
                        {s.effectivePoints}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 rounded-full font-black text-xs border ${
                            s.statusColor === "rose"
                              ? "bg-rose-100 text-rose-950 border-rose-400"
                              : s.statusColor === "orange"
                              ? "bg-orange-100 text-orange-950 border-orange-400"
                              : s.statusColor === "amber"
                              ? "bg-amber-100 text-amber-950 border-amber-400"
                              : s.statusColor === "blue"
                              ? "bg-blue-100 text-blue-950 border-blue-400"
                              : "bg-emerald-100 text-emerald-950 border-emerald-400"
                          }`}
                        >
                          {s.disciplineStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs text-slate-700 text-xs font-medium">
                        {s.latestCounselingNote || (
                          <span className="text-slate-400 italic font-normal">Belum ada catatan konseling</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenCoachingModal(s.id)}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs transition inline-flex items-center gap-1 border border-blue-200"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-blue-700" />
                          <span>Bimbingan</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: VERIFIKASI PRESTASI (APPROVE / REJECT) */}
      {/* ==================================================================== */}
      {verifyingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-300 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                    verifyStatus === "approved"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-rose-100 text-rose-800 border-rose-300"
                  }`}
                >
                  {verifyStatus === "approved" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </div>
                <h3 className="text-sm font-black text-slate-900">
                  {verifyStatus === "approved" ? "Persetujuan Prestasi Siswa" : "Penolakan Pengajuan Prestasi"}
                </h3>
              </div>
              <button
                onClick={() => setVerifyingItem(null)}
                className="text-slate-500 hover:text-slate-800 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-300 text-xs space-y-1.5">
              <div className="text-slate-600 font-bold">Nama Siswa:</div>
              <div className="font-black text-slate-900">{verifyingItem.studentName}</div>
              <div className="text-slate-600 font-bold">Prestasi:</div>
              <div className="font-bold text-slate-800">{verifyingItem.achievementName}</div>
              <div className="text-slate-600 font-medium">Kategori: {verifyingItem.category}</div>
            </div>

            {verifyStatus === "approved" ? (
              <div className="space-y-2 text-xs">
                <label className="block font-bold text-slate-800">
                  Tetapkan Nilai Poin Merit <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={assignedMeritPoints}
                  onChange={(e) => setAssignedMeritPoints(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 text-sm"
                />
                <p className="text-xs text-slate-600 font-medium">
                  Poin ini akan otomatis masuk ke Saldo Prestasi siswa untuk dapat digunakan sebagai pemutihan.
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <label className="block font-bold text-slate-800">
                  Alasan Penolakan <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan alasan penolakan (cth: bukti tidak sah, format berkas tidak terbaca)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setVerifyingItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isVerifying || (verifyStatus === "rejected" && !rejectionReason.trim())}
                onClick={handleConfirmVerification}
                className={`px-5 py-2 rounded-xl text-white font-bold text-xs transition ${
                  verifyStatus === "approved"
                    ? "bg-emerald-700 hover:bg-emerald-800"
                    : "bg-rose-700 hover:bg-rose-800"
                }`}
              >
                {isVerifying ? "Menyimpan..." : verifyStatus === "approved" ? "Konfirmasi Setujui" : "Konfirmasi Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: CATAT PEMBINAAN & REKOMENDASI */}
      {/* ==================================================================== */}
      {isCoachingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-300 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center border border-blue-300">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">
                  Catat Bimbingan Kedisiplinan &amp; Rekomendasi BK
                </h3>
              </div>
              <button
                onClick={() => setIsCoachingModalOpen(false)}
                className="text-slate-500 hover:text-slate-800 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitCoaching} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Pilih Siswa <span className="text-rose-600">*</span>
                </label>
                <select
                  value={coachingTargetStudentId}
                  onChange={(e) => setCoachingTargetStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold"
                >
                  {availableStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.className}) — Status: {s.status} (Poin: {s.effectivePoints})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Jenis Konseling / Pembinaan <span className="text-rose-600">*</span>
                </label>
                <select
                  value={coachingType}
                  onChange={(e) => setCoachingType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold"
                >
                  <option value="Bimbingan Kedisiplinan">Bimbingan Kedisiplinan &amp; Tata Tertib</option>
                  <option value="Konseling Individu">Konseling Individu</option>
                  <option value="Konferensi Kasus (Case Conference)">Konferensi Kasus / Pemanggilan Wali</option>
                  <option value="Pembinaan Budi Pekerti & Karakter">Pembinaan Budi Pekerti &amp; Karakter</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Catatan Sesi Konseling (Counseling Notes) <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Rincian proses pembinaan, komitmen siswa, dan hasil wawancara konseling..."
                  value={counselingNotes}
                  onChange={(e) => setCounselingNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Tindak Lanjut (Follow-Up Actions)
                </label>
                <input
                  type="text"
                  placeholder="cth: Tugas piket kebersihan 3 hari / Pemantauan apel pagi"
                  value={followUpActions}
                  onChange={(e) => setFollowUpActions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Rekomendasi Pembinaan (Recommendations)
                </label>
                <input
                  type="text"
                  placeholder="cth: Wajib konseling lanjutan pekan depan / Pemanggilan Orang Tua"
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCoachingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCoaching}
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition shadow-xs"
                >
                  {isSubmittingCoaching ? "Menyimpan..." : "Simpan Sesi Bimbingan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
