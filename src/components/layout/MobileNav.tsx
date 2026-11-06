"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { MOBILE_BOTTOM_NAV, getTeacherMobileNavigation } from "@/lib/constants/navigation";
import { UserRole, UserProfile, normalizeRole } from "@/types/auth";

interface MobileNavProps {
  role?: string;
  user?: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ role, user, isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const normalizedRole = normalizeRole(role || user?.role);
  const bottomItems =
    normalizedRole === "guru"
      ? getTeacherMobileNavigation(user)
      : MOBILE_BOTTOM_NAV[normalizedRole] || MOBILE_BOTTOM_NAV.siswa;

  return (
    <>
      {/* 1. Mobile Slide-Over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onClose}
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Close Button Header */}
            <div className="absolute right-3 top-3 z-20">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition cursor-pointer"
                aria-label="Tutup menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reused Sidebar inside Drawer */}
            <Sidebar role={normalizedRole} user={user} onNavigate={onClose} className="w-full border-none shadow-none" />
          </div>
        </div>
      )}

      {/* 2. Mobile Fixed Bottom Navigation Bar (Phone Screens) */}
      <nav
        aria-label="Navigasi Bawah Seluler"
        className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around sm:hidden select-none"
      >
        {bottomItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/guru" && pathname.startsWith("/guru/report"));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all ${
                isActive
                  ? "text-blue-600 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? "bg-blue-50 text-blue-600" : "text-slate-400"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="mt-0.5 truncate max-w-[64px]">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
