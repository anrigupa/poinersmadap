import Link from "next/link";
import { ArrowLeft, BookOpen, ShieldCheck } from "lucide-react";
import { RULES_DATA } from "@/data/mockRules";

export const metadata = {
  title: "Buku Saku Tata Tertib - SMADAP POINER",
  description: "Katalog aturan pelanggaran dan bobot poin resmi SMA Negeri 2 Playen",
};

export default function RulesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <Link href="/login" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition">
            <span>Masuk Portal</span>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
          <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-4 h-4" />
            <span>Dokumen Resmi Tata Tertib</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Katalog Aturan & Bobot Poin Pelanggaran
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-2 max-w-2xl leading-relaxed">
            Pedoman kedisiplinan siswa SMA Negeri 2 Playen tahun ajaran aktif. Pelanggaran diklasifikasikan ke dalam kategori Ringan, Sedang, dan Berat.
          </p>
        </div>

        <div className="space-y-4">
          {(["Ringan", "Sedang", "Berat"] as const).map((kategori) => {
            const rules = RULES_DATA.filter((r) => r.kategori === kategori);
            const badgeColor =
              kategori === "Ringan"
                ? "bg-amber-100 text-amber-800 border-amber-200"
                : kategori === "Sedang"
                ? "bg-orange-100 text-orange-800 border-orange-200"
                : "bg-rose-100 text-rose-800 border-rose-200";

            return (
              <div key={kategori} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                      Kategori {kategori}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">({rules.length} Aturan)</span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {rules.map((rule) => (
                    <div key={rule.id} className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-900">{rule.deskripsi}</div>
                        <div className="text-[11px] text-slate-400">Kode: {rule.kode}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="inline-block px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {Math.abs(rule.poin)} Poin
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
