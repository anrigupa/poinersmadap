"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Mail,
  User,
  Calendar,
  Clock,
  MapPin,
  FileText,
  AlertTriangle,
  Info,
  CheckCircle2,
  Eye,
  Edit3,
  Building2,
  GraduationCap,
  Layers,
  Printer,
  Download,
  Loader2,
} from "lucide-react";
import { CoachingStudentItem, CounselorStudentOption } from "@/features/counseling/types";
import {
  CALL_PURPOSE_OPTIONS,
  CALL_TYPE_OPTIONS,
} from "@/features/counseling/schemas/callLetterSchema";
import {
  LetterTemplateSchema,
  LetterTemplateVariableContext,
  DEFAULT_PLACEHOLDER_LETTER_TEMPLATE,
  loadLetterTemplate,
  hydrateLetterTemplate,
} from "@/features/counseling/lib/letterTemplateEngine";
import {
  printLetterDocument,
  downloadLetterAsPdf,
} from "@/features/counseling/lib/documentActions";

// Registered external templates available in public/templates/
export const AVAILABLE_LETTER_TEMPLATES = [
  { id: "surat-panggilan-orang-tua", label: "Surat Panggilan Orang Tua / Wali (Standard)" },
  { id: "surat-pernyataan", label: "Surat Pernyataan Komitmen Siswa" },
  { id: "berita-acara-konseling", label: "Berita Acara Sesi Konseling & BK" },
] as const;

interface SuratPanggilanModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: CoachingStudentItem | CounselorStudentOption | null;
  counselorName?: string;
  onSuccess?: (message: string) => void;
}

export default function SuratPanggilanModal({
  isOpen,
  onClose,
  student,
  counselorName = "Guru BK",
  onSuccess,
}: SuratPanggilanModalProps) {
  // Extract Auto-filled fields with strict type guards
  const studentName = student
    ? "studentName" in student
      ? student.studentName
      : (student as CounselorStudentOption).fullName
    : "-";

  const studentNisn = student
    ? "studentNisn" in student
      ? (student as CoachingStudentItem).studentNisn || "-"
      : (student as CounselorStudentOption).nisn || "-"
    : "-";

  const studentNis = student
    ? "studentNis" in student
      ? (student as CoachingStudentItem).studentNis || "-"
      : (student as CounselorStudentOption).nis || "-"
    : "-";

  const className = student?.className || "-";

  const totalViolations = student
    ? "totalViolations" in student
      ? (student as CoachingStudentItem).totalViolations
      : (student as CounselorStudentOption).totalViolationPoints > 0
      ? Math.ceil((student as CounselorStudentOption).totalViolationPoints / 10)
      : 0
    : 0;

  const totalViolationPoints = student
    ? "totalViolationPoints" in student
      ? (student as CoachingStudentItem).totalViolationPoints
      : (student as CounselorStudentOption).totalViolationPoints
    : 0;

  const totalReductionPoints = student
    ? "totalReductionPoints" in student
      ? (student as CoachingStudentItem).totalReductionPoints
      : 0
    : 0;

  const effectivePoints = student
    ? "effectivePoints" in student
      ? (student as CoachingStudentItem).effectivePoints
      : (student as CounselorStudentOption).effectivePoints
    : 0;

  const disciplineStatus = student
    ? "disciplineStatus" in student
      ? (student as CoachingStudentItem).disciplineStatus
      : (student as CounselorStudentOption).status || "Aman"
    : "Aman";

  const statusColor = student && "statusColor" in student ? (student as CoachingStudentItem).statusColor : "amber";

  // Derive initial Call Type based on sanction status
  const defaultCallType = (() => {
    if (disciplineStatus.includes("SP3")) return "SP3";
    if (disciplineStatus.includes("SP2")) return "SP2";
    if (disciplineStatus.includes("SP1")) return "SP1";
    return "Panggilan Rutin BK";
  })();

  // Manual Input form states (persisted across preview and template switches)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("surat-panggilan-orang-tua");
  const [templateSchema, setTemplateSchema] = useState<LetterTemplateSchema>(DEFAULT_PLACEHOLDER_LETTER_TEMPLATE);
  const [letterNumber, setLetterNumber] = useState(
    `421.3/BK-SMADAP/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`
  );
  const [callType, setCallType] = useState<string>(defaultCallType);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [location, setLocation] = useState("Ruang Bimbingan & Konseling (BK) SMAN 2 Pangkep");
  const [purpose, setPurpose] = useState<string>(CALL_PURPOSE_OPTIONS[0]);
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Mode state: "form" | "preview"
  const [activeView, setActiveView] = useState<"form" | "preview">("form");
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const letterElementId = "printable-school-letter";

  // Load external template when selectedTemplateId changes
  useEffect(() => {
    let isMounted = true;
    loadLetterTemplate(selectedTemplateId).then((tmpl) => {
      if (isMounted) {
        setTemplateSchema(tmpl);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedTemplateId]);

  // Build variable context for hydrating external template
  const variableContext: LetterTemplateVariableContext = useMemo(() => {
    const todayFormatted = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const scheduledDateFormatted = scheduledDate
      ? new Date(scheduledDate).toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "-";

    const letterSubject =
      callType === "Panggilan Rutin BK"
        ? "Undangan Bimbingan & Konseling"
        : `Surat Panggilan Orang Tua / Wali (${callType})`;

    return {
      // Header placeholders (school-agnostic placeholders)
      header_gov_agency: "Pemerintah Provinsi Sulawesi Selatan",
      header_edu_dept: "Dinas Pendidikan",
      header_institution_name: "UPT SMAN 2 PANGKEP",
      header_address:
        "Alamat: Jl. Poros Tonasa II, Desa Baring, Kec. Segeri, Kab. Pangkajene dan Kepulauan, Sulawesi Selatan 90654",
      header_contact: "Laman: sman2pangkep.sch.id • Pos-el: info@sman2pangkep.sch.id",

      // Metadata
      letter_number: letterNumber,
      letter_subject: letterSubject,
      date_location: `Pangkep, ${todayFormatted}`,

      // Student info
      student_name: studentName,
      student_nisn: studentNisn,
      student_nis: studentNis,
      student_class: className,
      total_violations: totalViolations,
      total_violation_points: totalViolationPoints,
      total_reduction_points: totalReductionPoints,
      effective_points: effectivePoints,
      discipline_status: disciplineStatus,

      // Meeting schedule
      scheduled_date_formatted: scheduledDateFormatted,
      scheduled_time: scheduledTime,
      meeting_location: location,
      call_purpose: purpose,
      additional_notes: additionalNotes || "-",

      // Signatures
      counselor_name: counselorName,
      counselor_nip: "SMAN 2 Pangkep",
    };
  }, [
    letterNumber,
    callType,
    studentName,
    studentNisn,
    studentNis,
    className,
    totalViolations,
    totalViolationPoints,
    totalReductionPoints,
    effectivePoints,
    disciplineStatus,
    scheduledDate,
    scheduledTime,
    location,
    purpose,
    additionalNotes,
    counselorName,
  ]);

  // Hydrated template for preview
  const renderedTemplate = useMemo(() => {
    return hydrateLetterTemplate(templateSchema, variableContext);
  }, [templateSchema, variableContext]);

  if (!isOpen || !student) return null;

  const handleOpenPreview = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveView("preview");
  };

  const handleBackToForm = () => {
    setActiveView("form");
  };

  const handlePrint = () => {
    printLetterDocument(letterElementId);
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    const sanitizedStudentName = studentName.replace(/[^a-zA-Z0-9]/g, "_");
    const sanitizedDocTitle = renderedTemplate.title.replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `${sanitizedDocTitle}_${sanitizedStudentName}_${studentNis}.pdf`;

    const success = await downloadLetterAsPdf(letterElementId, fileName);
    setIsExportingPdf(false);

    if (success && onSuccess) {
      onSuccess(`Dokumen PDF (${fileName}) berhasil diunduh.`);
    }
  };

  const handleFinish = () => {
    if (onSuccess) {
      onSuccess(`Surat (${renderedTemplate.title}) untuk siswa ${studentName} berhasil disiapkan.`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-300 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center shadow-xs">
              <Mail className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                {activeView === "form" ? "Formulir Surat Panggilan Orang Tua / Wali" : "Preview Surat Panggilan"}
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {activeView === "form"
                  ? "Lengkapi informasi administrasi dan pilih template surat dinas yang sesuai."
                  : "Pratinjau naskah dinas formal surat pemanggilan orang tua / wali peserta didik."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/60 transition"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs">
          {/* ================================================================= */}
          {/* AUTO-FILLED SECTION: STUDENT DISCIPLINARY SUMMARY */}
          {/* ================================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Informasi Peserta Didik (Auto-filled)</span>
              </span>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-black border ${
                  statusColor === "rose"
                    ? "bg-rose-100 text-rose-950 border-rose-300"
                    : statusColor === "orange"
                    ? "bg-orange-100 text-orange-950 border-orange-300"
                    : statusColor === "amber"
                    ? "bg-amber-100 text-amber-950 border-amber-300"
                    : "bg-blue-100 text-blue-950 border-blue-300"
                }`}
              >
                Status Disiplin: {disciplineStatus}
              </span>
            </div>

            {/* Primary Student Identification */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="text-[11px] font-semibold text-slate-500">Nama Siswa</div>
                <div className="text-sm font-black text-slate-900 truncate">{studentName}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-500">NISN / NIS</div>
                <div className="text-xs font-mono font-bold text-slate-800">
                  {studentNisn} <span className="text-slate-400 font-normal">/ {studentNis}</span>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-500">Kelas</div>
                <div className="text-xs font-bold text-slate-800">{className}</div>
              </div>
            </div>

            {/* 4-Stat Metric Grid for Disciplinary Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Stat 1: Total Pelanggaran */}
              <div className="p-3 rounded-xl bg-slate-100/90 border border-slate-200">
                <div className="text-base font-black font-mono text-slate-900">{totalViolations}</div>
                <div className="text-[11px] font-bold text-slate-800">Total Pelanggaran</div>
                <div className="text-[10px] text-slate-500 font-medium">Kasus tercatat</div>
              </div>

              {/* Stat 2: Total Poin Pelanggaran */}
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <div className="text-base font-black font-mono text-rose-800">{totalViolationPoints}</div>
                <div className="text-[11px] font-bold text-rose-950">Poin Pelanggaran</div>
                <div className="text-[10px] text-rose-700/80 font-medium">Akumulasi bruto</div>
              </div>

              {/* Stat 3: Total Pemutihan */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-base font-black font-mono text-emerald-800">
                  {totalReductionPoints > 0 ? `-${totalReductionPoints}` : "0"}
                </div>
                <div className="text-[11px] font-bold text-emerald-950">Total Pemutihan</div>
                <div className="text-[10px] text-emerald-700/80 font-medium">Reduksi BK</div>
              </div>

              {/* Stat 4: Poin Efektif */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <div className="text-base font-black font-mono text-amber-900">{effectivePoints}</div>
                <div className="text-[11px] font-bold text-amber-950">Poin Efektif</div>
                <div className="text-[10px] text-amber-800/80 font-medium">Poin aktif saat ini</div>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* ================================================================= */}
          {/* VIEW 1: MANUAL INPUT FORM */}
          {/* ================================================================= */}
          {activeView === "form" ? (
            <form onSubmit={handleOpenPreview} className="space-y-4">
              {/* Row 0: Template Selector */}
              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>Pilih Template Surat (External Template Engine) <span className="text-rose-600">*</span></span>
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {AVAILABLE_LETTER_TEMPLATES.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Template dimuat secara eksternal dari <code>public/templates/{selectedTemplateId}.json</code>.
                </p>
              </div>

              {/* Row 1: Nomor Surat & Klasifikasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Nomor Surat <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={letterNumber}
                    onChange={(e) => setLetterNumber(e.target.value)}
                    placeholder="cth: 421.3/BK-SMADAP/2026/101"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Klasifikasi Panggilan <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={callType}
                    onChange={(e) => setCallType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CALL_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Hari / Tanggal & Waktu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Hari / Tanggal Pertemuan <span className="text-rose-600">*</span></span>
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Waktu Pertemuan <span className="text-rose-600">*</span></span>
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 3: Tempat / Ruangan */}
              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tempat Pertemuan <span className="text-rose-600">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ruang Bimbingan & Konseling (BK) SMAN 2 Pangkep"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Row 4: Keperluan Pertemuan */}
              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Keperluan / Agenda Bimbingan <span className="text-rose-600">*</span></span>
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CALL_PURPOSE_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 5: Catatan Tambahan */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Catatan Tambahan untuk Orang Tua / Wali
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Mohon membawa berkas pendukung atau identitas orang tua saat menghadiri ruang konseling..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Informational Banner */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Setelah melengkapi formulir, klik tombol <strong>Preview Surat</strong> untuk melihat tampilan naskah dinas formal yang ter-render secara dinamis dari template terpilih.
                </p>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Surat</span>
                </button>
              </div>
            </form>
          ) : (
            /* =============================================================== */
            /* VIEW 2: DYNAMIC RENDERED LETTER TEMPLATE PREVIEW */
            /* =============================================================== */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between gap-3 text-amber-950">
                <div className="flex items-center gap-2.5">
                  <Eye className="w-4 h-4 text-amber-800 shrink-0" />
                  <div>
                    <div className="font-bold text-xs">{renderedTemplate.title}</div>
                    <div className="text-[11px] text-amber-900/90">
                      Template: <code>public/templates/{selectedTemplateId}.json</code> (v{renderedTemplate.version})
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleBackToForm}
                  className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-950 hover:bg-amber-100 font-bold text-xs transition flex items-center gap-1 shadow-xs shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Ubah Data</span>
                </button>
              </div>

              {/* Formal School Letter Sheet */}
              <div
                id={letterElementId}
                className="p-6 sm:p-8 rounded-2xl border-2 border-slate-300 bg-white space-y-4 shadow-sm text-slate-900"
              >
                {/* 1. Temporary Letter Header (Placeholder Kop Surat) */}
                <div className="pb-3 border-b-4 border-double border-slate-900 flex items-center gap-4 text-center">
                  {/* Left School Emblem Placeholder */}
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-300 flex flex-col items-center justify-center text-slate-700 shrink-0 shadow-xs">
                    <GraduationCap className="w-7 h-7 text-slate-800" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">
                      {renderedTemplate.header.leftEmblemPlaceholder || "SMADAP"}
                    </span>
                  </div>

                  {/* Header Title Block */}
                  <div className="flex-1 space-y-0.5">
                    <div className="font-bold text-xs tracking-wider text-slate-800 uppercase font-sans">
                      {renderedTemplate.header.governmentAgency}
                    </div>
                    <div className="font-bold text-xs tracking-wider text-slate-800 uppercase font-sans">
                      {renderedTemplate.header.educationDepartment}
                    </div>
                    <div className="font-black text-base sm:text-lg text-slate-900 tracking-wide font-sans uppercase">
                      {renderedTemplate.header.institutionName}
                    </div>
                    <div className="text-[10px] text-slate-600 leading-tight font-sans">
                      {renderedTemplate.header.addressLine}
                    </div>
                    <div className="text-[9px] text-slate-500 font-sans font-medium">
                      {renderedTemplate.header.contactLine}
                    </div>
                  </div>

                  {/* Right Regency Emblem Placeholder */}
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-300 flex flex-col items-center justify-center text-slate-700 shrink-0 shadow-xs hidden sm:flex">
                    <Building2 className="w-7 h-7 text-slate-800" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">
                      {renderedTemplate.header.rightEmblemPlaceholder || "PANGKEP"}
                    </span>
                  </div>
                </div>

                {/* 2. Nomor Surat & Metadata */}
                <div className="text-xs space-y-1 pt-1 font-sans">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <div className="grid grid-cols-[80px_1fr] gap-1">
                        <span className="font-semibold text-slate-700">Nomor</span>
                        <span className="font-mono text-slate-900 font-bold">
                          : {renderedTemplate.metadata.referenceNumber}
                        </span>
                      </div>
                      <div className="grid grid-cols-[80px_1fr] gap-1">
                        <span className="font-semibold text-slate-700">Lampiran</span>
                        <span className="text-slate-900">: {renderedTemplate.metadata.attachment}</span>
                      </div>
                      <div className="grid grid-cols-[80px_1fr] gap-1">
                        <span className="font-semibold text-slate-700">Perihal</span>
                        <span className="font-bold text-slate-900 underline">
                          : {renderedTemplate.metadata.subject}
                        </span>
                      </div>
                    </div>

                    <div className="text-right text-slate-700 font-medium">
                      {renderedTemplate.metadata.dateLocation}
                    </div>
                  </div>
                </div>

                {/* Recipient Block */}
                <div className="pt-3 text-xs space-y-0.5 font-sans">
                  {renderedTemplate.recipient.salutation && (
                    <div>{renderedTemplate.recipient.salutation}</div>
                  )}
                  <div className="font-bold text-slate-900">
                    {renderedTemplate.recipient.addressee}
                  </div>
                  {renderedTemplate.recipient.location && (
                    <div className="text-slate-600">{renderedTemplate.recipient.location}</div>
                  )}
                </div>

                {/* Formal Letter Body */}
                <div className="text-xs leading-relaxed space-y-3 font-sans text-slate-800 pt-1">
                  {renderedTemplate.opening.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}

                  {/* 3. Student Information Table */}
                  {renderedTemplate.studentInfoSections.length > 0 && (
                    <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-300 text-xs space-y-1.5 font-sans">
                      {renderedTemplate.studentInfoSections.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-[160px_1fr] gap-2">
                          <span className="text-slate-600 font-medium">{item.label}</span>
                          <span className="font-bold text-slate-900">: {item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {renderedTemplate.invitationIntro && (
                    <p>{renderedTemplate.invitationIntro}</p>
                  )}

                  {/* 4. Meeting Schedule / Agenda Table */}
                  {renderedTemplate.meetingSchedule.length > 0 && (
                    <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-300 text-xs space-y-1.5 font-sans">
                      {renderedTemplate.meetingSchedule.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-[160px_1fr] gap-2">
                          <span className="text-slate-600 font-medium">{item.label}</span>
                          <span className="font-bold text-slate-900">: {item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {renderedTemplate.notes && renderedTemplate.notes !== "-" && (
                    <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-amber-950 text-[11px] leading-relaxed">
                      <strong>{renderedTemplate.notesIntro || "Catatan:"}</strong> {renderedTemplate.notes}
                    </div>
                  )}

                  {renderedTemplate.closing.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {/* 5. Signature Area */}
                <div className="pt-6 grid grid-cols-2 gap-4 text-xs font-sans">
                  {/* Left Signature */}
                  <div className="text-center space-y-16">
                    <div className="text-slate-700">
                      {renderedTemplate.signatures.left.role}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 underline">
                        {renderedTemplate.signatures.left.placeholderName || "( .................................................... )"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {renderedTemplate.signatures.left.caption || "Tanda Tangan & Nama Terang"}
                      </div>
                    </div>
                  </div>

                  {/* Right Signature */}
                  <div className="text-center space-y-16">
                    <div className="text-slate-700">
                      {renderedTemplate.signatures.right.role}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 underline">
                        {renderedTemplate.signatures.right.name}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {renderedTemplate.signatures.right.identifier}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Footer Actions with Document Actions (Print & Download PDF) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleBackToForm}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Ubah Data Formulir</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Action 1: Cetak / Print */}
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold transition shadow-xs flex items-center gap-1.5"
                    title="Cetak Surat Langsung"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                    <span>Cetak</span>
                  </button>

                  {/* Action 2: Unduh / Download PDF */}
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isExportingPdf}
                    className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-bold transition shadow-xs flex items-center gap-1.5"
                    title="Unduh Naskah Format PDF"
                  >
                    {isExportingPdf ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 text-blue-200" />
                    )}
                    <span>{isExportingPdf ? "Memproses PDF..." : "Unduh PDF"}</span>
                  </button>

                  {/* Action 3: Selesai & Tutup */}
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Selesai &amp; Simpan</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
