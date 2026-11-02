"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Sparkles, School } from "lucide-react";
import { ROLE_NAVIGATION } from "@/lib/constants/navigation";
import { ROLE_LABELS } from "@/lib/constants/auth";
import { UserRole } from "@/types/auth";

interface SidebarProps {
  role: UserRole;
  className?: string;
  onNavigate?: () => void;
}

export default function Sidebar({ role, className = "", onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const navSections = ROLE_NAVIGATION[role] || ROLE_NAVIGATION.siswa;
  const roleMeta = ROLE_LABELS[role] || {
    title: role,
    subtitle: "",
    badge: "bg-slate-100 text-slate-700",
  };

  return (
    <aside
      className={`w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between h-full select-none ${className}`}
    >
      {/* Brand & School Header */}
      <div>
        <div className="p-5 border-b border-slate-100">
          <Link
            href="/"
            onClick={onNavigate}
            className="flex items-center gap-3 group transition"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-black text-slate-900 tracking-tight text-base leading-none">
                SMADAP POINER
              </div>
              <div className="text-[11px] text-slate-400 font-medium truncate mt-1">
                SMAN 2 PANGKEP
              </div>
            </div>
          </Link>

          {/* Role Pill */}
          <div className="mt-3.5 pt-3 border-t border-slate-100/80 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Portal Akses
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleMeta.badge}`}
            >
              {role.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-190px)]">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {section.sectionTitle && (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {section.sectionTitle}
                </div>
              )}

              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                        }`}
                      />
                      <span className="truncate">{item.title}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          isActive
                            ? "bg-white/20 text-white"
                            : item.badgeColor || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer System Info Card */}
      <div className="p-3 border-t border-slate-100 m-2">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[11px] font-bold text-slate-700">Tahun Ajaran 2024/2025</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Semester Ganjil &bull; Disiplin Positif</div>
        </div>
      </div>
    </aside>
  );
}
