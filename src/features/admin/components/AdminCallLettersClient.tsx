"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Mail,
  Search,
  Filter,
  Calendar,
  FileText,
  Printer,
  Download,
  Eye,
  UserCheck,
  AlertTriangle,
  Building2,
  GraduationCap,
  Users,
  Clock,
  MapPin,
  X,
  Layers,
  ArrowUpDown,
  RefreshCw,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { PageHeader, SectionHeader, StatCard, Badge } from "@/components/ui";
import { tables } from "@/lib/design-system";
import {
  AdminCallLettersData,
  AdminCallLetterItem,
} from "@/features/admin/types/letters";
import {
  printLetterDocument,
  downloadLetterAsPdf,
} from "@/features/counseling/lib/documentActions";

interface AdminCallLettersClientProps {
  initialData: AdminCallLettersData;
}

type TimeFilterOption = "all" | "month" | "semester" | "year";
type StatusFilterOption = "all" | "Monitoring" | "SP1" | "SP2" | "SP3";

export default function AdminCallLettersClient({
  initialData,
}: AdminCallLettersClientProps) {
  const [data, setData] = useState<AdminCallLettersData>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("all");

  // Selected letter for preview modal
  const [selectedLetter, setSelectedLetter] = useState<AdminCallLetterItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const letterElementId = "printable-admin-letter-preview";

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return data.items.filter((item) => {
      // 1. Search Query (Nama Siswa, NISN, Guru BK, Nomor Surat)
      if (query) {
        const matchesName = item.studentName.toLowerCase().includes(query);
        const matchesNisn = item.studentNisn.toLowerCase().includes(query);
        const matchesNis = item.studentNis.toLowerCase().includes(query);
        const matchesCounselor = item.counselorName.toLowerCase().includes(query);
        const matchesNumber = item.letterNumber.toLowerCase().includes(query);
        const matchesClass = item.className.toLowerCase().includes(query);

        if (
          !matchesName &&
          !matchesNisn &&
          !matchesNis &&
          !matchesCounselor &&
          !matchesNumber &&
          !matchesClass
        ) {
          return false;
        }
      }

      // 2. Status Filter (Monitoring, SP1, SP2, SP3)
      if (statusFilter !== "all" && item.disciplineStatus !== statusFilter) {
        return false;
      }

      // 3. Time Filter (Bulan Ini, Semester Ini, Tahun Ajaran Ini)
      if (timeFilter !== "all") {
        const d = new Date(item.date);
        if (timeFilter === "month") {
          if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) {
            return false;
          }
        } else if (timeFilter === "semester") {
          // Ganjil: Jul (6) - Dec (11), Genap: Jan (0) - Jun (5)
          const isSecondHalf = currentMonth >= 6;
          const itemSecondHalf = d.getMonth() >= 6;
          if (isSecondHalf !== itemSecondHalf || d.getFullYear() !== currentYear) {
            return false;
          }
        } else if (timeFilter === "year") {
          if (d.getFullYear() !== currentYear) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data.items, searchQuery, statusFilter, timeFilter]);

  const handleOpenPreview = (item: AdminCallLetterItem) => {
    setSelectedLetter(item);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setSelectedLetter(null);
  };

  const handlePrint = (item?: AdminCallLetterItem) => {
    const target = item || selectedLetter;
    if (!target) return;

    if (!isPreviewOpen) {
      setSelectedLetter(target);
      setIsPreviewOpen(true);
      setTimeout(() => {
        printLetterDocument(letterElementId);
      }, 300);
    } else {
      printLetterDocument(letterElementId);
    }
  };

  const handleDownloadPdf = async (item?: AdminCallLetterItem) => {
    const target = item || selectedLetter;
    if (!target) return;

    if (!isPreviewOpen) {
      setSelectedLetter(target);
      setIsPreviewOpen(true);
    }

    setIsExportingPdf(true);
    const sanitizedStudentName = target.studentName.replace(/[^a-zA-Z0-9]/g, "_");
    const sanitizedLetterNumber = target.letterNumber.replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `Surat_Panggilan_${sanitizedStudentName}_${sanitizedLetterNumber}.pdf`;

    setTimeout(async () => {
      try {
        const success = await downloadLetterAsPdf(letterElementId, fileName);
        setIsExportingPdf(false);
        if (success) {
          setActionNotice(`Dokumen PDF (${fileName}) berhasil diunduh.`);
          setTimeout(() => setActionNotice(null), 4000);
        }
      } catch (err) {
        setIsExportingPdf(false);
        console.error("PDF export error:", err);
      }
    }, 400);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        title="Surat Panggilan Orang Tua (SP)"
        description="Monitoring dan rekapitulasi seluruh surat panggilan orang tua / wali berbasis bimbingan konseling dan tata tertib kedisiplinan siswa SMAN 2 Pangkep."
        badge={
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            {data.academicPeriod.year} • {data.academicPeriod.semester}
          </span>
        }
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/students"
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition shadow-2xs flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Data Siswa</span>
            </Link>
          </div>
        }
      />

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Dashboard Cards (StatCard 3-step hierarchy) */}
      <section className="space-y-3">
        <SectionHeader
          title="Metrik Surat Panggilan"
          description="Statistik akumulasi naskah dinas pemanggilan orang tua dan pembinaan kedisiplinan siswa."
          icon={Mail}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            value={data.summary.totalLetters}
            label="Total Surat Panggilan"
            description="Akumulasi seluruh surat panggilan diterbitkan"
            icon={FileText}
            badgeText="Arsip Aktif"
            badgeVariant="info"
          />
          <StatCard
            value={data.summary.lettersThisMonth}
            label="Surat Bulan Ini"
            description="Naskah dinas dibuat pada bulan kalender berjalan"
            icon={Calendar}
            badgeText="Bulan Ini"
            badgeVariant="info"
          />
          <StatCard
            value={data.summary.studentsInCoaching}
            label="Siswa Dalam Pembinaan"
            description="Peserta didik dengan sanksi SP1, SP2, SP3, atau konseling"
            icon={AlertTriangle}
            badgeText="Coaching BK"
            badgeVariant="warning"
          />
          <StatCard
            value={data.summary.activeCounselors}
            label="Guru BK Aktif"
            description="Tenaga konseling dan kesiswaan bertugas"
            icon={UserCheck}
            badgeText="Standar Layanan"
            badgeVariant="success"
          />
        </div>
      </section>

      {/* 3. Table Section with Search & Multi-Filters */}
      <section className="space-y-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <SectionHeader
            title="Daftar Surat Panggilan Orang Tua / Wali"
            description="Pencarian, pemantauan status sanksi, dan cetak ulang naskah dinas resmi pemanggilan."
            icon={Layers}
            badge={
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
                {filteredItems.length} Surat Ditemukan
              </span>
            }
          />

          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-t border-slate-100">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama siswa, NISN, Guru BK, atau nomor surat..."
                className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Time Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setTimeFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  timeFilter === "all"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "hover:text-slate-900"
                }`}
              >
                Semua Waktu
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter("month")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  timeFilter === "month"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "hover:text-slate-900"
                }`}
              >
                Bulan Ini
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter("semester")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  timeFilter === "semester"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "hover:text-slate-900"
                }`}
              >
                Semester Ini
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter("year")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  timeFilter === "year"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "hover:text-slate-900"
                }`}
              >
                Tahun Ini
              </button>
            </div>
          </div>

          {/* Sanction Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter Status:
            </span>
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition border ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              Semua ({data.items.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("Monitoring")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition border ${
                statusFilter === "Monitoring"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100"
              }`}
            >
              Monitoring BK
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("SP1")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition border ${
                statusFilter === "SP1"
                  ? "bg-amber-600 text-white border-amber-600"
                  : "bg-amber-50 text-amber-950 border-amber-200 hover:bg-amber-100"
              }`}
            >
              SP1 (36–75 Poin)
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("SP2")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition border ${
                statusFilter === "SP2"
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-orange-50 text-orange-950 border-orange-200 hover:bg-orange-100"
              }`}
            >
              SP2 (76–150 Poin)
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("SP3")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition border ${
                statusFilter === "SP3"
                  ? "bg-rose-600 text-white border-rose-600"
                  : "bg-rose-50 text-rose-950 border-rose-200 hover:bg-rose-100"
              }`}
            >
              SP3 (≥151 Poin)
            </button>
          </div>

          {/* Table Container */}
          {filteredItems.length === 0 ? (
            <div className="py-14 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              <Mail className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-900">
                Tidak ada surat panggilan ditemukan
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {searchQuery || statusFilter !== "all" || timeFilter !== "all"
                  ? "Coba sesuaikan kata kunci pencarian atau opsi filter Anda."
                  : "Belum ada naskah surat panggilan diterbitkan oleh Guru BK."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className={tables.table}>
                <thead className={tables.thead}>
                  <tr>
                    <th className={tables.th}>No</th>
                    <th className={tables.th}>Tanggal</th>
                    <th className={tables.th}>Nomor Surat</th>
                    <th className={tables.th}>Nama Siswa</th>
                    <th className={tables.th}>NISN</th>
                    <th className={tables.th}>Kelas</th>
                    <th className={tables.th}>Guru BK</th>
                    <th className={tables.th}>Status Disiplin</th>
                    <th className={`${tables.th} text-right`}>Aksi</th>
                  </tr>
                </thead>
                <tbody className={tables.tbody}>
                  {filteredItems.map((item, index) => {
                    const statusBadgeVariant =
                      item.disciplineStatus === "SP3"
                        ? "danger"
                        : item.disciplineStatus === "SP2"
                        ? "warning"
                        : item.disciplineStatus === "SP1"
                        ? "warning"
                        : item.disciplineStatus === "Monitoring"
                        ? "info"
                        : "success";

                    return (
                      <tr key={item.id} className={tables.row}>
                        {/* No */}
                        <td className={`${tables.td} font-mono text-slate-400 text-center w-12`}>
                          {index + 1}
                        </td>

                        {/* Tanggal */}
                        <td className={`${tables.td} whitespace-nowrap`}>
                          <div className="flex items-center gap-1.5 font-medium text-slate-800">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{item.formattedDate}</span>
                          </div>
                        </td>

                        {/* Nomor Surat */}
                        <td className={`${tables.td} whitespace-nowrap`}>
                          <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            {item.letterNumber}
                          </span>
                        </td>

                        {/* Nama Siswa */}
                        <td className={tables.td}>
                          <div className="font-bold text-slate-900">{item.studentName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            NIS: {item.studentNis}
                          </div>
                        </td>

                        {/* NISN */}
                        <td className={`${tables.td} font-mono text-xs text-slate-600`}>
                          {item.studentNisn || "-"}
                        </td>

                        {/* Kelas */}
                        <td className={`${tables.td} whitespace-nowrap`}>
                          <span className="font-semibold text-slate-800 font-mono bg-slate-100 px-2 py-0.5 rounded-md text-xs">
                            {item.className}
                          </span>
                        </td>

                        {/* Guru BK */}
                        <td className={tables.td}>
                          <div className="font-medium text-slate-900 text-xs truncate max-w-[160px]">
                            {item.counselorName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            NIP: {item.counselorNip || "-"}
                          </div>
                        </td>

                        {/* Status Disiplin */}
                        <td className={`${tables.td} whitespace-nowrap`}>
                          <Badge variant={statusBadgeVariant}>
                            {item.disciplineStatus} ({item.effectivePoints} Poin)
                          </Badge>
                        </td>

                        {/* Aksi */}
                        <td className={`${tables.td} text-right whitespace-nowrap`}>
                          <div className="flex items-center justify-end gap-1">
                            {/* Lihat Surat */}
                            <button
                              type="button"
                              onClick={() => handleOpenPreview(item)}
                              title="Lihat Naskah Surat"
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-blue-600 transition shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Cetak Ulang */}
                            <button
                              type="button"
                              onClick={() => handlePrint(item)}
                              title="Cetak Ulang Surat"
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-amber-700 transition shadow-2xs"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Download PDF */}
                            <button
                              type="button"
                              onClick={() => handleDownloadPdf(item)}
                              title="Unduh PDF Resmi"
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-rose-700 transition shadow-2xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
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
      </section>

      {/* =================================================================== */}
      {/* 4. MODAL: PREVIEW, CETAK ULANG & DOWNLOAD PDF SURAT RESMI */}
      {/* =================================================================== */}
      {isPreviewOpen && selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-3xl border border-slate-300 shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 border border-blue-300 flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base">
                    Naskah Dinas: Surat Panggilan Orang Tua
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Nomor: {selectedLetter.letterNumber}
                  </p>
                </div>
              </div>

              {/* Action Buttons in Modal Header */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrint()}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 text-slate-800 bg-white hover:bg-slate-50 transition shadow-2xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-700" />
                  <span>Cetak Ulang</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPdf()}
                  disabled={isExportingPdf}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isExportingPdf ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengunduh...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClosePreview}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Indonesian Official School Letter Preview */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60">
              <div
                id={letterElementId}
                className="max-w-2xl mx-auto p-6 sm:p-10 bg-white border border-slate-300 rounded-2xl shadow-sm text-slate-900 text-xs sm:text-sm space-y-5 leading-relaxed font-serif"
              >
                {/* 1. Official Kop Surat (Letterhead) */}
                <div className="pb-3 border-b-4 border-double border-slate-900 text-center font-sans">
                  <div className="flex items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-300 flex flex-col items-center justify-center text-slate-800 shrink-0">
                      <GraduationCap className="w-8 h-8 text-blue-900" />
                      <span className="text-[7px] font-black uppercase tracking-tighter">SMADAP</span>
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="font-bold text-xs uppercase text-slate-700 tracking-wider">
                        Pemerintah Provinsi Sulawesi Selatan
                      </div>
                      <div className="font-bold text-xs uppercase text-slate-700 tracking-wider">
                        Dinas Pendidikan
                      </div>
                      <div className="font-black text-base sm:text-lg text-slate-950 tracking-tight">
                        UPT SMAN 2 PANGKEP
                      </div>
                      <div className="text-[10px] text-slate-600 font-sans">
                        Alamat: Jl. Poros Tonasa II, Desa Baring, Kec. Segeri, Kab. Pangkep 90654
                      </div>
                      <div className="text-[9px] text-slate-500 font-sans">
                        Laman: sman2pangkep.sch.id • Pos-el: info@sman2pangkep.sch.id
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Metadata Section */}
                <div className="flex justify-between items-start text-xs font-sans pt-1">
                  <div className="space-y-0.5">
                    <div><span className="font-semibold">Nomor</span>: {selectedLetter.letterNumber}</div>
                    <div><span className="font-semibold">Lampiran</span>: -</div>
                    <div><span className="font-semibold">Perihal</span>: <strong>Surat Panggilan Orang Tua / Wali Siswa</strong></div>
                  </div>
                  <div className="text-right">
                    Pangkep, {selectedLetter.formattedDate}
                  </div>
                </div>

                {/* 3. Recipient Block */}
                <div className="pt-2 text-xs font-sans">
                  <div>Kepada Yth.</div>
                  <div className="font-bold">Bapak / Ibu Orang Tua / Wali dari:</div>
                  <div className="font-bold text-slate-900">{selectedLetter.studentName}</div>
                  <div>di Tempat</div>
                </div>

                {/* 4. Letter Body Paragraphs */}
                <div className="space-y-2 text-xs leading-relaxed text-justify font-sans">
                  <p>Dengan hormat,</p>
                  <p>
                    Sehubungan dengan program pembinaan budi pekerti, tata tertib, dan evaluasi kedisiplinan peserta didik di lingkungan SMAN 2 Pangkep, bersama surat ini kami mengundang Bapak/Ibu Orang Tua/Wali dari peserta didik:
                  </p>

                  {/* Student Table */}
                  <div className="my-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 font-mono text-[11px]">
                    <div className="grid grid-cols-3">
                      <span className="font-bold text-slate-600 font-sans">Nama Siswa:</span>
                      <span className="col-span-2 font-bold text-slate-900">{selectedLetter.studentName}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="font-bold text-slate-600 font-sans">NIS / NISN:</span>
                      <span className="col-span-2">{selectedLetter.studentNis} / {selectedLetter.studentNisn || "-"}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="font-bold text-slate-600 font-sans">Kelas:</span>
                      <span className="col-span-2">{selectedLetter.className}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="font-bold text-slate-600 font-sans">Akumulasi Poin:</span>
                      <span className="col-span-2 font-bold text-rose-700">
                        {selectedLetter.effectivePoints} Poin ({selectedLetter.disciplineStatus})
                      </span>
                    </div>
                  </div>

                  <p>
                    Untuk hadir pada pertemuan koordinasi dan konseling pembinaan yang dijadwalkan pada:
                  </p>

                  {/* Meeting Details Table */}
                  <div className="my-2 p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-1 text-[11px] font-sans">
                    <div className="grid grid-cols-3">
                      <span className="font-bold text-slate-600">Hari / Tanggal:</span>
                      <span className="col-span-2 font-bold text-slate-900">
                        {new Date(selectedLetter.scheduledDate || selectedLetter.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="font-bold text-slate-600">Waktu:</span>
                      <span className="col-span-2">{selectedLetter.scheduledTime || "09:00"} WITA</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="font-bold text-slate-600">Tempat:</span>
                      <span className="col-span-2 font-semibold text-slate-900">{selectedLetter.location || "Ruang Bimbingan & Konseling (BK) SMAN 2 Pangkep"}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="font-bold text-slate-600">Keperluan:</span>
                      <span className="col-span-2">{selectedLetter.purpose || selectedLetter.counselingType}</span>
                    </div>
                  </div>

                  {selectedLetter.notes && (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
                      <strong>Catatan Tambahan:</strong> {selectedLetter.notes}
                    </div>
                  )}

                  <p>
                    Mengingat pentingnya koordinasi demi masa depan dan kelancaran pendidikan putra/putri Bapak/Ibu, kami sangat mengharapkan kehadiran Bapak/Ibu tepat pada waktu yang telah ditentukan.
                  </p>
                  <p>
                    Atas perhatian dan kerja sama yang baik, kami ucapkan terima kasih.
                  </p>
                </div>

                {/* 5. Signature Section */}
                <div className="pt-6 grid grid-cols-2 text-center text-xs font-sans">
                  <div>
                    <div>Mengetahui,</div>
                    <div className="font-bold">Kepala SMAN 2 Pangkep</div>
                    <div className="h-16 flex items-center justify-center text-slate-300 text-[10px] italic">
                      [Tanda Tangan &amp; Cap Sekolah]
                    </div>
                    <div className="font-bold underline text-slate-900">
                      Drs. H. Syarifuddin, M.Pd.
                    </div>
                    <div className="text-[10px] text-slate-600">NIP. 196803121994121002</div>
                  </div>

                  <div>
                    <div>Guru Bimbingan &amp; Konseling (BK),</div>
                    <div className="h-16 flex items-center justify-center text-slate-300 text-[10px] italic">
                      [Tanda Tangan]
                    </div>
                    <div className="font-bold underline text-slate-900">
                      {selectedLetter.counselorName}
                    </div>
                    <div className="text-[10px] text-slate-600">
                      NIP. {selectedLetter.counselorNip || "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-sans">
                Dokumen resmi sistem kedisiplinan POINER SMAN 2 Pangkep.
              </span>
              <button
                type="button"
                onClick={handleClosePreview}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
