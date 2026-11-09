import Link from "next/link";
import { ArrowLeft, BookOpen, Inbox } from "lucide-react";
import { getCategoriesAction, getViolationsAction } from "@/features/rules/actions";
import { getCurrentSession } from "@/features/auth/actions/authActions";
import DashboardShell from "@/components/layout/DashboardShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Buku Saku Tata Tertib - SMADAP POINER",
  description: "Katalog aturan pelanggaran dan bobot poin resmi SMAN 2 PANGKEP",
};

export default async function RulesPage() {
  const [session, categories, violationsRes] = await Promise.all([
    getCurrentSession(),
    getCategoriesAction(),
    getViolationsAction({ pageSize: 200, sortBy: "code", sortOrder: "asc" }),
  ]);

  const rules = violationsRes.items;
  const hasRules = rules.length > 0;

  const rulesCatalog = (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
          <BookOpen className="w-4 h-4" />
          <span>Dokumen Resmi Tata Tertib</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Katalog Aturan & Bobot Poin Pelanggaran
        </h1>
        <p className="text-xs sm:text-sm text-blue-100 mt-2 max-w-2xl leading-relaxed">
          Pedoman kedisiplinan siswa SMAN 2 PANGKEP tahun ajaran aktif. Pelanggaran diklasifikasikan ke dalam kategori resmi.
        </p>
      </div>

      {!hasRules ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Belum Ada Aturan Dikonfigurasi</h3>
          <p className="text-xs text-slate-500 max-w-md">
            Pedoman tata tertib dan bobot poin pelanggaran belum ditambahkan oleh administrator sekolah.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => {
            const categoryRules = rules.filter(
              (r) =>
                r.categoryId === category.id ||
                r.categoryName?.toLowerCase() === category.name.toLowerCase()
            );

            if (categoryRules.length === 0) return null;

            const isBerat = category.name.toLowerCase().includes("berat");
            const isSedang = category.name.toLowerCase().includes("sedang");
            const badgeColor = isBerat
              ? "bg-rose-100 text-rose-800 border-rose-200"
              : isSedang
              ? "bg-amber-100 text-amber-800 border-amber-200"
              : "bg-blue-100 text-blue-800 border-blue-200";

            return (
              <div
                key={category.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
              >
                <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                      Kategori {category.name}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      ({categoryRules.length} Aturan)
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {categoryRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition"
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-900">{rule.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">Kode: {rule.code}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="inline-block px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {rule.points} Poin
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // 1. Authenticated User (Teacher, Student, Admin): Use DashboardShell
  if (session) {
    const backHref =
      session.user.role === "guru"
        ? "/guru"
        : session.user.role === "siswa"
        ? "/siswa"
        : "/admin";

    const backLabel =
      session.user.role === "guru"
        ? "Kembali ke Dashboard Guru"
        : session.user.role === "siswa"
        ? "Kembali ke Dashboard Siswa"
        : "Kembali ke Dashboard Admin";

    return (
      <DashboardShell user={session.user} role={session.user.role}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{backLabel}</span>
            </Link>
          </div>
          {rulesCatalog}
        </div>
      </DashboardShell>
    );
  }

  // 2. Unauthenticated Visitor: Use Public Layout
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
          >
            <span>Masuk</span>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {rulesCatalog}
      </div>
    </main>
  );
}
