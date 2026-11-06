"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  ShieldCheck,
  Clock,
  Plus,
  History,
  Trash2,
  Power,
  Search,
  Inbox,
  X,
} from "lucide-react";
import {
  SemesterOption,
  SystemSettingsData,
} from "@/features/settings/types";
import {
  ACADEMIC_YEAR_OPTIONS,
  SEMESTER_OPTIONS,
} from "@/features/settings/schemas";
import {
  updateAcademicSettingsAction,
  createAcademicPeriodAction,
  activateAcademicPeriodByIdAction,
  deleteAcademicPeriodAction,
} from "@/features/settings/actions";

interface SystemSettingsClientProps {
  initialData: SystemSettingsData;
  adminName: string;
}

export default function SystemSettingsClient({
  initialData,
  adminName,
}: SystemSettingsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [settingsData, setSettingsData] =
    useState<SystemSettingsData>(initialData);
  const [selectedYear, setSelectedYear] = useState<string>(
    initialData.activeSetting.academicYear
  );
  const [selectedSemester, setSelectedSemester] = useState<SemesterOption>(
    initialData.activeSetting.semester
  );

  // Add New Academic Period Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newYearInput, setNewYearInput] = useState<string>("2027/2028");
  const [newSemesterInput, setNewSemesterInput] =
    useState<SemesterOption>("Genap");
  const [newSetActive, setNewSetActive] = useState<boolean>(false);

  // History Table Filters
  const [historySearch, setHistorySearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [semesterFilter, setSemesterFilter] = useState<
    "all" | "Ganjil" | "Genap"
  >("all");

  const [banner, setBanner] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const activeSetting = settingsData.activeSetting;
  const activeCount = settingsData.allSettings.filter((s) => s.isActive).length;
  const hasChanges =
    selectedYear !== activeSetting.academicYear ||
    selectedSemester !== activeSetting.semester;

  const availableYearOptions = Array.from(
    new Set([
      ...ACADEMIC_YEAR_OPTIONS,
      ...settingsData.allSettings.map((s) => s.academicYear),
    ])
  ).sort((a, b) => a.localeCompare(b));

  const broadcastAndApplyData = (data: SystemSettingsData, msg: string) => {
    setSettingsData(data);
    setSelectedYear(data.activeSetting.academicYear);
    setSelectedSemester(data.activeSetting.semester);
    setBanner({ type: "success", message: msg });

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("smadap:academic-settings-updated", {
          detail: {
            academicYear: data.activeSetting.academicYear,
            semester: data.activeSetting.semester,
          },
        })
      );
    }
    router.refresh();
  };

  const handleSetActiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);

    startTransition(async () => {
      try {
        const result = await updateAcademicSettingsAction({
          academicYear: selectedYear,
          semester: selectedSemester,
        });

        if (!result.success) {
          setBanner({ type: "error", message: result.message });
          return;
        }

        if (result.data) {
          broadcastAndApplyData(result.data, result.message);
        }
      } catch (err: any) {
        setBanner({
          type: "error",
          message:
            err?.message ||
            "Terjadi kesalahan saat menyimpan pengaturan tahun ajaran.",
        });
      }
    });
  };

  const handleAddPeriodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);

    startTransition(async () => {
      try {
        const result = await createAcademicPeriodAction({
          academicYear: newYearInput.trim(),
          semester: newSemesterInput,
          setAsActive: newSetActive,
        });

        if (!result.success) {
          setBanner({ type: "error", message: result.message });
          return;
        }

        if (result.data) {
          setNewSetActive(false);
          setIsAddModalOpen(false);
          broadcastAndApplyData(result.data, result.message);
        }
      } catch (err: any) {
        setBanner({
          type: "error",
          message:
            err?.message || "Gagal menambahkan periode tahun ajaran baru.",
        });
      }
    });
  };

  const handleActivateById = (id: string) => {
    setBanner(null);

    startTransition(async () => {
      try {
        const result = await activateAcademicPeriodByIdAction(id);
        if (!result.success) {
          setBanner({ type: "error", message: result.message });
          return;
        }
        if (result.data) {
          broadcastAndApplyData(result.data, result.message);
        }
      } catch (err: any) {
        setBanner({
          type: "error",
          message: err?.message || "Gagal mengaktifkan periode.",
        });
      }
    });
  };

  const handleDeleteById = (id: string) => {
    setBanner(null);

    startTransition(async () => {
      try {
        const result = await deleteAcademicPeriodAction(id);
        if (!result.success) {
          setBanner({ type: "error", message: result.message });
          return;
        }
        if (result.data) {
          broadcastAndApplyData(result.data, result.message);
        }
      } catch (err: any) {
        setBanner({
          type: "error",
          message: err?.message || "Gagal menghapus periode.",
        });
      }
    });
  };

  const filteredHistory = settingsData.allSettings.filter((item) => {
    const matchesSearch =
      item.academicYear.toLowerCase().includes(historySearch.toLowerCase()) ||
      item.semester.toLowerCase().includes(historySearch.toLowerCase()) ||
      (item.updatedBy || "")
        .toLowerCase()
        .includes(historySearch.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && item.isActive) ||
      (statusFilter === "inactive" && !item.isActive);

    const matchesSemester =
      semesterFilter === "all" || item.semester === semesterFilter;

    return matchesSearch && matchesStatus && matchesSemester;
  });

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Page Header (Consistent with Student & Teacher Management Pages) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-600/10 text-blue-600">
              <Settings className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Pengaturan Sistem &amp; Tahun Ajaran
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Kelola Tahun Ajaran dan Semester aktif serta riwayat periode akademik untuk pencatatan poin kedisiplinan SMAN 2 PANGKEP.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.refresh()}
            disabled={isPending}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-sm cursor-pointer disabled:opacity-50"
            title="Muat Ulang Data"
            aria-label="Muat Ulang Data"
          >
            <RefreshCw
              className={`w-4 h-4 ${isPending ? "animate-spin text-blue-600" : ""}`}
            />
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Periode</span>
          </button>
        </div>
      </div>

      {/* 2. Summary Metrics Cards (Value -> Label -> Description) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-md border border-blue-300">
              Periode Berjalan
            </span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {activeSetting.academicYear}
            </div>
            <div className="text-sm font-semibold text-slate-800 mt-1.5">
              Tahun Ajaran Aktif
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Periode akademik berjalan
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-md border border-purple-300">
              Semester
            </span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-700 font-mono tracking-tight">
              {activeSetting.semester}
            </div>
            <div className="text-sm font-semibold text-slate-800 mt-1.5">
              Semester Aktif
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeSetting.semester === "Ganjil"
                ? "Periode Juli – Desember"
                : "Periode Januari – Juni"}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300">
              Database
            </span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <History className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {settingsData.allSettings.length} Periode
            </div>
            <div className="text-sm font-semibold text-slate-800 mt-1.5">
              Total Riwayat
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Terdaftar dalam database
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-emerald-950 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
              Integritas
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono tracking-tight">
              {activeCount} Aktif
            </div>
            <div className="text-sm font-semibold text-slate-800 mt-1.5">
              Status Validasi
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Proteksi tunggal terverifikasi
            </p>
          </div>
        </div>
      </div>

      {/* 3. Feedback Banner (Success / Error) */}
      {banner && (
        <div
          role={banner.type === "error" ? "alert" : "status"}
          className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
            banner.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-start gap-3">
            {banner.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs">
              <div className="font-bold text-sm">
                {banner.type === "success"
                  ? "Konfigurasi Berhasil Disimpan"
                  : "Gagal Menyimpan Pengaturan"}
              </div>
              <p className="mt-0.5 opacity-90">{banner.message}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setBanner(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-slate-500 transition cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Section: Academic Year Configuration Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Konfigurasi Tahun Ajaran Aktif
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih Tahun Ajaran dan Semester yang berlaku saat ini. Hanya satu periode yang dapat aktif pada satu waktu.
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Aktif: {activeSetting.academicYear} ({activeSetting.semester})
          </span>
        </div>

        <form onSubmit={handleSetActiveSubmit} className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Field 1: Current Academic Year */}
            <div>
              <label
                htmlFor="academic-year-select"
                className="block text-xs font-bold text-slate-700 mb-2"
              >
                Tahun Ajaran (Current Academic Year)
              </label>
              <select
                id="academic-year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                disabled={isPending}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition disabled:opacity-50"
              >
                {availableYearOptions.map((yr) => (
                  <option key={yr} value={yr}>
                    Tahun Ajaran {yr}
                    {yr === activeSetting.academicYear ? " (Aktif)" : ""}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Opsi utama: 2026/2027, 2027/2028, 2028/2029, 2029/2030
              </p>
            </div>

            {/* Field 2: Semester */}
            <div>
              <label
                htmlFor="semester-select"
                className="block text-xs font-bold text-slate-700 mb-2"
              >
                Semester Aktif
              </label>
              <select
                id="semester-select"
                value={selectedSemester}
                onChange={(e) =>
                  setSelectedSemester(e.target.value as SemesterOption)
                }
                disabled={isPending}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition disabled:opacity-50"
              >
                {SEMESTER_OPTIONS.map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem} (
                    {sem === "Ganjil" ? "Juli – Desember" : "Januari – Juni"})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Menentukan periode pelaporan bulanan pada dashboard seluruh portal
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {hasChanges ? (
                <span className="text-blue-600 font-semibold">
                  Perubahan dipilih: Tahun Ajaran {selectedYear} &bull; Semester{" "}
                  {selectedSemester}
                </span>
              ) : (
                <span>
                  Terakhir diperbarui pada {formatDate(activeSetting.updatedAt)}{" "}
                  oleh <strong>{activeSetting.updatedBy || adminName}</strong>
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengaturan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 5. Academic Year History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Riwayat Tahun Ajaran
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar periode akademik yang terdaftar beserta status aktivasi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Cari tahun ajaran..."
                className="w-full sm:w-44 pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>

            <select
              value={semesterFilter}
              onChange={(e) =>
                setSemesterFilter(e.target.value as "all" | "Ganjil" | "Genap")
              }
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="all">Semua Semester</option>
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "all" | "active" | "inactive"
                )
              }
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
              <Inbox className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700">
              Tidak Ada Data Tahun Ajaran
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
              Ubah kata kunci pencarian atau klik tombol Tambah Periode di kanan atas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Tahun Ajaran</th>
                  <th className="py-3.5 px-4">Semester</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Tanggal Dibuat</th>
                  <th className="py-3.5 px-4">Terakhir Diperbarui</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredHistory.map((item) => (
                  <tr
                    key={item.id}
                    className={`transition ${
                      item.isActive
                        ? "bg-emerald-50/30"
                        : "hover:bg-slate-50/60"
                    }`}
                  >
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            item.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900">
                          {item.academicYear}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md font-semibold text-[11px] border ${
                          item.semester === "Ganjil"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-purple-50 text-purple-700 border-purple-200"
                        }`}
                      >
                        Semester {item.semester}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          Nonaktif
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {formatDate(item.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {formatDate(item.updatedAt)}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 px-2 py-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Sedang Aktif</span>
                        </span>
                      ) : (
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleActivateById(item.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 text-[11px] font-semibold transition cursor-pointer disabled:opacity-50"
                          >
                            <Power className="w-3 h-3" />
                            <span>Aktifkan</span>
                          </button>

                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleDeleteById(item.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 transition cursor-pointer disabled:opacity-50"
                            title="Hapus periode"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Menampilkan <strong>{filteredHistory.length}</strong> dari{" "}
            <strong>{settingsData.allSettings.length}</strong> periode tahun ajaran
          </span>
          <span className="font-medium text-slate-600">
            Hanya 1 tahun ajaran dapat aktif pada satu waktu
          </span>
        </div>
      </div>

      {/* 6. Modal: Tambah Periode Tahun Ajaran Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Tambah Periode Tahun Ajaran
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Daftarkan periode akademik baru ke sistem
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPeriodSubmit} className="p-5 space-y-4">
              <div>
                <label
                  htmlFor="new-academic-year"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  Tahun Ajaran (Format YYYY/YYYY)
                </label>
                <input
                  id="new-academic-year"
                  type="text"
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(e.target.value)}
                  placeholder="Contoh: 2027/2028"
                  disabled={isPending}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {ACADEMIC_YEAR_OPTIONS.map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setNewYearInput(yr)}
                      className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-slate-700 transition cursor-pointer"
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="new-semester"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  Semester
                </label>
                <select
                  id="new-semester"
                  value={newSemesterInput}
                  onChange={(e) =>
                    setNewSemesterInput(e.target.value as SemesterOption)
                  }
                  disabled={isPending}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newSetActive}
                  onChange={(e) => setNewSetActive(e.target.checked)}
                  disabled={isPending}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-800">
                    Jadikan sebagai Periode Aktif
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Periode aktif sebelumnya ({activeSetting.academicYear}{" "}
                    {activeSetting.semester}) akan otomatis dinonaktifkan.
                  </div>
                </div>
              </label>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "Menyimpan..." : "Simpan Periode"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
