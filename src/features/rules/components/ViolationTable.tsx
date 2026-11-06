"use client";

import { Edit, Trash2, ShieldAlert, Award, FileText } from "lucide-react";
import { ViolationItem } from "@/features/rules/types";

interface ViolationTableProps {
  items: ViolationItem[];
  onEdit: (item: ViolationItem) => void;
  onDelete: (item: ViolationItem) => void;
}

export default function ViolationTable({ items, onEdit, onDelete }: ViolationTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">Tidak ada aturan pelanggaran</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Aturan yang dicari tidak ditemukan atau belum ditambahkan ke katalog tata tertib.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Kode & Kategori</th>
              <th className="py-3.5 px-4">Nama Pelanggaran</th>
              <th className="py-3.5 px-4">Deskripsi Tata Tertib</th>
              <th className="py-3.5 px-4 text-center">Bobot Sanksi</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {items.map((item) => {
              const isHeavy = item.points >= 50;
              const isMedium = item.points >= 15 && item.points < 50;

              return (
                <tr key={item.id} className="hover:bg-slate-50/60 transition group">
                  {/* Kode & Kategori */}
                  <td className="py-3.5 px-4 sm:px-6 align-top">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md inline-block w-fit">
                        {item.code}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full border w-fit"
                        style={{
                          borderColor: `${item.categoryColor}40`,
                          backgroundColor: `${item.categoryColor}15`,
                          color: item.categoryColor,
                        }}
                      >
                        {item.categoryName}
                      </span>
                    </div>
                  </td>

                  {/* Nama Pelanggaran */}
                  <td className="py-3.5 px-4 align-top max-w-xs">
                    <div className="font-bold text-slate-900 text-xs">{item.name}</div>
                    {item.sanctionRecommendation && (
                      <div className="text-[11px] text-slate-400 mt-1 italic">
                        Sanksi: {item.sanctionRecommendation}
                      </div>
                    )}
                  </td>

                  {/* Deskripsi */}
                  <td className="py-3.5 px-4 align-top text-slate-600 text-xs leading-relaxed max-w-md">
                    {item.description}
                  </td>

                  {/* Bobot Poin */}
                  <td className="py-3.5 px-4 align-top text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-xl text-xs font-bold border ${
                        isHeavy
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : isMedium
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      +{item.points} Poin
                    </span>
                  </td>

                  {/* Aksi */}
                  <td className="py-3.5 px-4 sm:px-6 align-top text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                        title="Edit aturan ini"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Hapus aturan ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
