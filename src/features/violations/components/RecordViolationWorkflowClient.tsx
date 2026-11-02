"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UserSearch,
  BookOpen,
  FileEdit,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Camera,
  MapPin,
  Calendar,
  Clock,
  Printer,
  RotateCcw,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";
import { StudentItem } from "@/features/students/types";
import { ViolationItem } from "@/features/rules/types";
import { UserProfile } from "@/types/auth";
import { RecordViolationResult } from "@/features/violations/types";
import { recordStudentViolationAction } from "@/features/violations/actions";
import SearchableStudentSelector from "@/features/violations/components/SearchableStudentSelector";
import ViolationRuleSelector from "@/features/violations/components/ViolationRuleSelector";
import PointImpactSummary from "@/features/violations/components/PointImpactSummary";

interface RecordViolationWorkflowClientProps {
  students: StudentItem[];
  rules: ViolationItem[];
  currentUser: UserProfile;
}

const COMMON_LOCATIONS = [
  "Gerbang Sekolah",
  "Halaman Upacara",
  "Kantin Belakang",
  "Toilet Gedung Barat",
  "Toilet Gedung Timur",
  "Ruang Kelas",
  "Laboratorium Komputer",
  "Perpustakaan",
  "Area Parkir Siswa",
  "Luar Lingkungan Sekolah",
];

const COMMON_SANCTIONS = [
  "Teguran lisan & pencatatan poin",
  "Peringatan tertulis & pembinaan wali kelas",
  "Penyitaan barang bukti sementara",
  "Pemanggilan orang tua / wali murid",
  "Rujukan konseling Guru BK",
  "Kerja sosial / kebersihan lingkungan",
];

export default function RecordViolationWorkflowClient({
  students,
  rules,
  currentUser,
}: RecordViolationWorkflowClientProps) {
  // Current Step: 1 | 2 | 3 | 4
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Workflow Selection State
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [selectedRule, setSelectedRule] = useState<ViolationItem | null>(null);

  // Step 3: Notes & Meta
  const [incidentDate, setIncidentDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const mins = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${mins}`;
  });
  const [location, setLocation] = useState("Ruang Kelas");
  const [notes, setNotes] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [sanctionAction, setSanctionAction] = useState(
    "Teguran lisan & pencatatan poin"
  );

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] =
    useState<RecordViolationResult | null>(null);

  // Handlers for step progression
  const handleNextFromStep1 = () => {
    if (!selectedStudent) {
      setErrorBanner("Silakan pilih salah satu siswa dari daftar di bawah.");
      return;
    }
    setErrorBanner(null);
    setCurrentStep(2);
  };

  const handleNextFromStep2 = () => {
    if (!selectedRule) {
      setErrorBanner("Silakan pilih pasal atau jenis pelanggaran.");
      return;
    }
    setErrorBanner(null);
    setCurrentStep(3);
  };

  const handleNextFromStep3 = () => {
    if (!notes.trim() || notes.length < 3) {
      setErrorBanner("Catatan kronologis kejadian wajib diisi minimal 3 karakter.");
      return;
    }
    setErrorBanner(null);
    setCurrentStep(4);
  };

  // Final Submit Handler
  const handleSubmitViolation = async () => {
    if (!selectedStudent || !selectedRule || !notes.trim()) {
      setErrorBanner("Data belum lengkap. Silakan periksa kembali formulir.");
      return;
    }

    setSubmitting(true);
    setErrorBanner(null);

    try {
      const res = await recordStudentViolationAction({
        studentId: selectedStudent.id,
        violationTypeId: selectedRule.id,
        points: selectedRule.points,
        incidentDate,
        location,
        notes,
        evidenceUrl: evidenceUrl || undefined,
        sanctionAction,
      });

      if (!res.success || !res.data) {
        setErrorBanner(res.message || "Gagal mencatat pelanggaran.");
      } else {
        setSubmittedResult(res.data);
      }
    } catch (err: any) {
      setErrorBanner(err.message || "Terjadi kesalahan pada server.");
    } finally {
      setSubmitting(false);
    }
  };

  // Reset workflow to record another
  const handleResetWorkflow = () => {
    setSelectedStudent(null);
    setSelectedRule(null);
    setNotes("");
    setEvidenceUrl("");
    setSubmittedResult(null);
    setErrorBanner(null);
    setCurrentStep(1);
  };

  // If already submitted, display complete confirmation receipt screen
  if (submittedResult) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 sm:p-8 text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-white/20 text-white flex items-center justify-center mx-auto mb-2 backdrop-blur-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Laporan Pelanggaran Berhasil Dicatat!
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-md mx-auto">
              Pelanggaran siswa telah tersimpan, poin telah diakumulasi, dan akun terhubung dengan rekam jejak guru.
            </p>
          </div>

          {/* Receipt Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Student & Violation Card */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold uppercase block">
                    Nama Siswa
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {submittedResult.studentName}
                  </span>
                  <span className="text-xs text-slate-500 block">
                    NIS: {submittedResult.studentNis} • Kelas: {submittedResult.className}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase block">
                    Poin Pelanggaran
                  </span>
                  <span className="text-base font-extrabold text-rose-600">
                    +{submittedResult.addedPoints} Poin
                  </span>
                </div>
              </div>

              {/* Point Progression Box */}
              <div className="grid grid-cols-2 gap-3 pt-1 text-center">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    Poin Sebelumnya
                  </span>
                  <span className="text-base font-bold text-slate-700">
                    {submittedResult.previousPoints} Poin
                  </span>
                  <span className="text-[10px] text-slate-400 block uppercase">
                    Status: {submittedResult.previousStatus}
                  </span>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                  <span className="text-[10px] text-blue-600 block font-bold">
                    Total Poin Baru
                  </span>
                  <span className="text-base font-extrabold text-blue-700">
                    {submittedResult.newTotalPoints} Poin
                  </span>
                  <span className="text-[10px] text-blue-700 block font-bold uppercase">
                    Status: {submittedResult.newStatus}
                  </span>
                </div>
              </div>

              {/* Rule & Incident Meta */}
              <div className="pt-2 text-xs space-y-1 text-slate-600">
                <div>
                  <strong>Pasal Pelanggaran:</strong> [{submittedResult.ruleCode}]{" "}
                  {submittedResult.violationName} ({submittedResult.categoryName})
                </div>
                <div>
                  <strong>Waktu Insiden:</strong> {submittedResult.formattedDate}
                </div>
                {submittedResult.location && (
                  <div>
                    <strong>Lokasi:</strong> {submittedResult.location}
                  </div>
                )}
                <div>
                  <strong>Guru Pelapor:</strong> {submittedResult.reportedByName}{" "}
                  {submittedResult.reportedByNip ? `(NIP: ${submittedResult.reportedByNip})` : ""}
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 mt-2 text-slate-700 italic">
                  &ldquo;{submittedResult.notes}&rdquo;
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleResetWorkflow}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Catat Pelanggaran Siswa Lain</span>
              </button>

              <Link
                href="/guru"
                className="w-full sm:w-auto py-3 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition text-center"
              >
                Kembali ke Beranda Guru
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Teacher Authority Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-600/10 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Pencatatan Pelanggaran Siswa
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Alur 4 tahap pencatatan insiden kedisiplinan siswa dengan kalkulasi poin otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            Guru Pelapor: <strong>{currentUser.fullName}</strong>
          </span>
        </div>
      </div>

      {/* 4-Step Stepper Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-4 gap-2">
          {[
            { step: 1, title: "1. Cari Siswa", icon: UserSearch },
            { step: 2, title: "2. Pilih Pasal", icon: BookOpen },
            { step: 3, title: "3. Catatan & Bukti", icon: FileEdit },
            { step: 4, title: "4. Tinjau & Simpan", icon: CheckCircle2 },
          ].map((item) => {
            const isCompleted = currentStep > item.step;
            const isCurrent = currentStep === item.step;
            const Icon = item.icon;

            return (
              <button
                key={item.step}
                type="button"
                onClick={() => {
                  if (item.step < currentStep) setCurrentStep(item.step);
                }}
                disabled={item.step > currentStep}
                className={`flex items-center justify-center sm:justify-start gap-2 p-2.5 rounded-xl text-xs font-bold transition text-left ${
                  isCurrent
                    ? "bg-blue-600 text-white shadow-xs"
                    : isCompleted
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : "text-slate-400 bg-slate-50 cursor-not-allowed"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorBanner && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Step Content Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        {/* STEP 1: Search Student */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserSearch className="w-4 h-4 text-blue-600" />
                Langkah 1: Cari & Pilih Siswa
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cari siswa berdasarkan nama, NIS, atau filter berdasarkan rombongan belajar kelas.
              </p>
            </div>

            <SearchableStudentSelector
              students={students}
              selectedStudent={selectedStudent}
              onSelect={(student) => {
                setSelectedStudent(student);
                setErrorBanner(null);
              }}
            />

            <div className="pt-4 flex items-center justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={handleNextFromStep1}
                disabled={!selectedStudent}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Lanjut ke Pilih Pasal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Select Violation */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Langkah 2: Pilih Pasal Pelanggaran
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih aturan tata tertib yang dilanggar oleh siswa{" "}
                <strong className="text-slate-800">
                  {selectedStudent?.fullName}
                </strong>
                .
              </p>
            </div>

            <ViolationRuleSelector
              rules={rules}
              selectedRule={selectedRule}
              onSelect={(rule) => {
                setSelectedRule(rule);
                setErrorBanner(null);
              }}
            />

            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>

              <button
                type="button"
                onClick={handleNextFromStep2}
                disabled={!selectedRule}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Lanjut ke Catatan & Bukti</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Add Notes & Evidence */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-blue-600" />
                Langkah 3: Tambahkan Catatan Kejadian & Foto Bukti
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Lengkapi waktu insiden, lokasi kejadian, kronologis objektif, dan tindakan langsung.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Incident Date & Time */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Waktu & Tanggal Kejadian <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden transition"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Lokasi Kejadian
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-hidden transition"
                >
                  {COMMON_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Catatan Kronologis Insiden <span className="text-red-500">*</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Contoh: Siswa ditemukan merokok di belakang kantin saat jam istirahat kedua bersama dua siswa lainnya..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden transition leading-relaxed"
              />
              <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                <span>Minimal 3 karakter. Bersifat objektif dan faktual.</span>
                <span>{notes.length}/1000</span>
              </div>
            </div>

            {/* Sanction Recommendation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tindakan Langsung / Penanganan Sekolah
              </label>
              <select
                value={sanctionAction}
                onChange={(e) => setSanctionAction(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-hidden transition"
              >
                {COMMON_SANCTIONS.map((sanc) => (
                  <option key={sanc} value={sanc}>
                    {sanc}
                  </option>
                ))}
              </select>
            </div>

            {/* Evidence URL / Photo Attachment */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-slate-400" />
                URL / Bukti Foto Insiden (Opsional)
              </label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://... atau tautan foto barang bukti"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden transition"
              />
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>

              <button
                type="button"
                onClick={handleNextFromStep3}
                disabled={!notes.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Tinjau & Simpan Laporan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Review & Submit */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Langkah 4: Tinjau Rangkuman & Simpan Laporan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pastikan data siswa, pasal pelanggaran, dan kronologis sudah akurat sebelum disimpan ke buku saku.
              </p>
            </div>

            {/* Point Impact Calculator Component */}
            <PointImpactSummary student={selectedStudent} rule={selectedRule} />

            {/* Review Summary Breakdown */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Siswa Pelanggar:</span>
                <span className="font-bold text-slate-900">
                  {selectedStudent?.fullName} (NIS: {selectedStudent?.nis} • Kelas: {selectedStudent?.className})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Pasal / Jenis:</span>
                <span className="font-bold text-slate-900">
                  [{selectedRule?.code}] {selectedRule?.name}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Kategori & Poin:</span>
                <span className="font-extrabold text-rose-600">
                  {selectedRule?.categoryName} (+{selectedRule?.points} Poin)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Waktu & Lokasi:</span>
                <span className="font-medium text-slate-800">
                  {incidentDate.replace("T", " ")} WIB • {location}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Tindakan Langsung:</span>
                <span className="font-medium text-slate-800">{sanctionAction}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block mb-1">Catatan Kronologi:</span>
                <p className="text-slate-800 italic bg-white p-2.5 rounded-lg border border-slate-200">
                  &ldquo;{notes}&rdquo;
                </p>
              </div>
            </div>

            {/* Submit Action Buttons */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Ubah Catatan</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitViolation}
                disabled={submitting}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Menyimpan & Mengupdate Poin...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi & Simpan Laporan Pelanggaran</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
