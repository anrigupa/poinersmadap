"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { ROLE_NAVIGATION, getTeacherNavigation } from "@/lib/constants/navigation";
import { ROLE_LABELS } from "@/lib/constants/auth";
import { getSystemSettingsAction } from "@/features/settings/actions";
import { UserRole, UserProfile, normalizeRole } from "@/types/auth";

interface SidebarProps {
  role?: string;
  user?: UserProfile;
  className?: string;
  onNavigate?: () => void;
}

export default function Sidebar({ role, user, className = "", onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const normalizedRole = normalizeRole(role || user?.role);
  const navSections =
    normalizedRole === "guru"
      ? getTeacherNavigation(user)
      : ROLE_NAVIGATION[normalizedRole] || ROLE_NAVIGATION.siswa;
  const roleMeta = ROLE_LABELS[normalizedRole] || {
    title: normalizedRole,
    subtitle: "",
    badge: "bg-slate-100 text-slate-700",
  };

  const [academicYear, setAcademicYear] = useState<string>("2026/2027");
  const [semester, setSemester] = useState<string>("Ganjil");

  useEffect(() => {
    let isMounted = true;
    getSystemSettingsAction()
      .then((res) => {
        if (isMounted && res?.activeSetting) {
          setAcademicYear(res.activeSetting.academicYear);
          setSemester(res.activeSetting.semester);
        }
      })
      .catch(() => {});

    const handleSettingsEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{
        academicYear: string;
        semester: string;
      }>;
      if (customEvent.detail) {
        setAcademicYear(customEvent.detail.academicYear);
        setSemester(customEvent.detail.semester);
      }
    };

    window.addEventListener(
      "smadap:academic-settings-updated",
      handleSettingsEvent
    );
    return () => {
      isMounted = false;
      window.removeEventListener(
        "smadap:academic-settings-updated",
        handleSettingsEvent
      );
    };
  }, []);

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
              {normalizedRole.toUpperCase()}
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
                const isActive =
                  pathname === item.href ||
                  (item.href === "/guru" && pathname.startsWith("/guru/report"));
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
            <span className="text-[11px] font-bold text-slate-700">
              Tahun Ajaran {academicYear}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Semester {semester} &bull; Disiplin Positif
          </div>
        </div>
      </div>
    </aside>
  );
}
