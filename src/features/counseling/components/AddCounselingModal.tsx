"use client";

import { useState, useTransition, useEffect } from "react";
import {
  X,
  Sparkles,
  Calendar,
  AlertCircle,
  CheckCircle2,
  MinusCircle,
  FileText,
  User,
  ShieldCheck,
} from "lucide-react";
import { recordCounselingSessionAction } from "@/features/counseling/actions";
import { CounselingFormData } from "@/features/counseling/schemas";

interface StudentOption {
  id: string;
  fullName: string;
  nis: string;
  nisn: string;
  className: string;
  totalViolationPoints: number;
}

interface AddCounselingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  students: StudentOption[];
  preselectedStudentId?: string;
}

const COUNSELING_TYPES = [
  "Bimbingan Kedisiplinan",
  "Konseling Individu",
  "Mediasi Siswa",
  "Konseling Kelompok",
  "Bimbingan Belajar & Karir",
  "Konferensi Kasus (Case Conference)",
  "Pembinaan Budi Pekerti & Karakter",
];

export default function AddCounselingModal({
  isOpen,
  onClose,
  onSuccess,
  students,
  preselectedStudentId,
}: AddCounselingModalProps) {
  const [selectedStudentId, setSelectedStudentId] = useState(
    preselectedStudentId || (students[0]?.id || "")
  );
  const [counselingType, setCounselingType] = useState(COUNSELING_TYPES[0]);
  const [description, setDescription] = useState("");
  const [counselingDate, setCounselingDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [pointReduction, setPointReduction] = useState<number>(0);
  const [reductionReason, setReductionReason] = useState("");
  const [evidenceNotes, setEvidenceNotes] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (preselectedStudentId) {
      setSelectedStudentId(preselectedStudentId);
    }
  }, [preselectedStudentId]);

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s.id === selectedStudentId);
  const currentPoints = currentStudent?.totalViolationPoints || 0;
  const resultingPoints = Math.max(0, currentPoints - (pointReduction || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedStudentId) {
      setErrorMsg("Silakan pilih siswa yang akan dibina.");
      return;
    }

    if (!description.trim() || description.trim().length < 5) {
      setErrorMsg("Deskripsi pembinaan minimal 5 karakter.");
      return;
    }

    if (pointReduction < 0) {
      setErrorMsg("Jumlah pengurangan poin tidak boleh bernilai negatif.");
      return;
    }

    if (pointReduction > currentPoints) {
      setErrorMsg(
        `Pengurangan poin (${pointReduction}) tidak boleh melebihi total poin siswa saat ini (${currentPoints} poin).`
      );
      return;
    }

    if (pointReduction > 0 && !reductionReason.trim()) {
      setErrorMsg("Alasan pemotongan poin wajib diisi jika ada pengurangan poin.");
      return;
    }

    const payload: CounselingFormData = {
      studentId: selectedStudentId,
      counselingType,
      description: description.trim(),
      counselingDate,
      pointReduction: Number(pointReduction) || 0,
      reductionReason: reductionReason.trim() || undefined,
      evidenceNotes: evidenceNotes.trim() || undefined,
    };

    startTransition(async () => {
      const res = await recordCounselingSessionAction(payload);
      if (res.success) {
        onSuccess(res.message);
        onClose();
        // Reset state
        setDescription("");
        setPointReduction(0);
        setReductionReason("");
        setEvidenceNotes("");
      } else {
        setErrorMsg(res.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Catat Konseling & Pemotongan Poin
              </h3>
              <p className="text-[11px] text-slate-400">
                Layanan Bimbingan Konseling (BK) & Pengurangan Poin Disiplin Siswa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Student Selector */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Pilih Siswa *</span>
              {currentStudent && (
                <span className="text-[11px] font-normal text-slate-400">
                  Poin Saat Ini: <strong className="text-rose-600 dark:text-rose-400 font-bold">{currentPoints} Poin</strong>
                </span>
              )}
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                setPointReduction(0);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm transition"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.className} - NIS: {s.nis}) — {s.totalViolationPoints} Poin
                </option>
              ))}
            </select>
          </div>

          {/* 2. Counseling Type & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Jenis Konseling *
              </label>
              <select
                value={counselingType}
                onChange={(e) => setCounselingType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm transition"
              >
                {COUNSELING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Tanggal Konseling *
              </label>
              <input
                type="date"
                value={counselingDate}
                onChange={(e) => setCounselingDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm transition"
              />
            </div>
          </div>

          {/* 3. Description / Notes */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Deskripsi & Catatan Pembinaan *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan materi konseling, komitmen perbaikan siswa, atau hasil kesepakatan pembinaan..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs leading-relaxed transition"
            />
          </div>

          {/* 4. POINT REDUCTION SUB-CARD */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MinusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  Pengurangan Poin Disiplin
                </span>
              </div>
              <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                Maksimal: {currentPoints} Poin
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Jumlah Poin yang Dipotong
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={currentPoints}
                    value={pointReduction}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setPointReduction(Math.max(0, Math.min(val, currentPoints)));
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    Poin
                  </span>
                </div>
              </div>

              {/* Real-time Calculation Indicator */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                <div className="text-slate-500 flex justify-between">
                  <span>Poin Saat Ini:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{currentPoints} Poin</span>
                </div>
                <div className="text-blue-600 dark:text-blue-400 flex justify-between">
                  <span>Dipotong:</span>
                  <span className="font-bold">-{pointReduction} Poin</span>
                </div>
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Poin Akhir:</span>
                  <span className={resultingPoints === 0 ? "text-emerald-600" : "text-amber-600"}>
                    {resultingPoints} Poin
                  </span>
                </div>
              </div>
            </div>

            {pointReduction > 0 && (
              <div className="space-y-3 pt-2 border-t border-blue-100 dark:border-blue-900/30">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Alasan Pengurangan Poin *
                  </label>
                  <input
                    type="text"
                    value={reductionReason}
                    onChange={(e) => setReductionReason(e.target.value)}
                    placeholder="Contoh: Telah menyelesaikan tugas bakti sosial dan surat komitmen disiplin"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Catatan Bukti / Keterangan Berkas
                  </label>
                  <input
                    type="text"
                    value={evidenceNotes}
                    onChange={(e) => setEvidenceNotes(e.target.value)}
                    placeholder="Contoh: Berita acara pembinaan no. BK/2026/XI/04 tertandatangani ortu & wali kelas"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-600/20 flex items-center gap-2"
            >
              {isPending && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              <span>Simpan Sesi Konseling</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
