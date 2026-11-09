"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  admin: "Administrator",
  guru: "Guru & BK",
  teacher: "Guru & BK",
  siswa: "Siswa",
  student: "Siswa",
  students: "Data Siswa",
  teachers: "Data Guru",
  rules: "Buku Saku Tata Tertib",
  letters: "Surat Panggilan (SP)",
  sanctions: "Surat Panggilan (SP)",
  settings: "Pengaturan",
  report: "Input Pelanggaran",
  classes: "Kelas Binaan",
  counseling: "Bimbingan Konseling",
  history: "Riwayat Laporan",
  profile: "Profil Pengguna",
  merits: "Prestasi & Pemutihan",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 overflow-x-auto py-1">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-700 transition shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Beranda</span>
      </Link>

      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const href = "/" + segments.slice(0, index + 1).join("/");
        const label = ROUTE_LABELS[segment] || decodeURIComponent(segment.replace(/-/g, " "));

        return (
          <div key={href} className="flex items-center shrink-0">
            <ChevronRight className="w-3 h-3 text-slate-300 mx-1.5 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-900 capitalize truncate max-w-[180px]">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-slate-900 transition capitalize text-slate-500"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
