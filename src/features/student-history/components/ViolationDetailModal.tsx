"use client";

import {
  X,
  Calendar,
  AlertTriangle,
  User,
  MapPin,
  FileText,
  Camera,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { StudentHistoryRecord } from "@/features/student-history/types";

interface ViolationDetailModalProps {
  isOpen: boolean;
  record: StudentHistoryRecord | null;
  onClose: () => void;
}

export default function ViolationDetailModal({
  isOpen,
  record,
  onClose,
}: ViolationDetailModalProps) {
  if (!isOpen || !record) return null;

  const isHeavy = record.categoryName === "Berat";
  const isMedium = record.categoryName === "Sedang";

  const catBadge = isHeavy
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : isMedium
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg border border-slate-100 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Detail Catatan Pelanggaran
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                ID Insiden: {record.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Rule Title & Points Card */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                  {record.ruleCode}
                </span>
                <span className={`font-semibold px-2.5 py-0.5 rounded-full border text-[11px] ${catBadge}`}>
                  {record.categoryName}
                </span>
              </div>
              <span className="px-3 py-1 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs">
                +{record.points} Poin
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900">
              {record.violationName}
            </h4>
          </div>

          {/* Incident Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> Waktu Kejadian
              </span>
              <div className="font-bold text-slate-800">{record.formattedDate}</div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" /> Guru Pelapor
              </span>
              <div className="font-bold text-slate-800">{record.teacherName}</div>
              {record.teacherNip && (
                <div className="text-[10px] text-slate-400 font-mono">
                  NIP: {record.teacherNip}
                </div>
              )}
            </div>
          </div>

          {/* Location if present */}
          {record.location && (
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" /> Lokasi Kejadian
              </span>
              <div className="font-bold text-slate-800">{record.location}</div>
            </div>
          )}

          {/* Kronologis / Catatan Kejadian */}
          <div className="space-y-1.5">
            <span className="font-semibold text-slate-700">
              Catatan Kronologis Kejadian:
            </span>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 leading-relaxed italic">
              &ldquo;{record.notes}&rdquo;
            </div>
          </div>

          {/* Photographic Evidence if exists */}
          {record.evidenceUrl && (
            <div className="space-y-1.5 pt-1">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-blue-600" /> Barang Bukti / Foto:
              </span>
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
                <img
                  src={record.evidenceUrl}
                  alt="Bukti Pelanggaran"
                  className="w-full h-48 object-cover group-hover:scale-102 transition duration-300"
                />
                <div className="p-2 bg-slate-900/80 text-white flex items-center justify-between text-[11px]">
                  <span>Foto Terlampir di Server Supabase Storage</span>
                  <a
                    href={record.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-300 hover:text-white flex items-center gap-1"
                  >
                    Buka Ukuran Penuh <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Consultation / Appeal Note */}
          <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-2xl flex items-start gap-2.5 text-blue-900">
            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed text-[11px]">
              <span className="font-bold">Konsultasi / Banding Poin:</span>
              <p>
                Jika Anda merasa terdapat kekeliruan pencatatan atau ingin mengajukan klarifikasi, Anda dapat menemui Guru BK atau Wali Kelas dengan membawa nomor insiden ini.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
