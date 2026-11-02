"use client";

import { Menu, Bell, Search } from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import UserMenu from "@/components/layout/UserMenu";
import { UserProfile } from "@/types/auth";

interface NavbarProps {
  user: UserProfile;
  onOpenMobileMenu: () => void;
}

export default function Navbar({ user, onOpenMobileMenu }: NavbarProps) {
  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Trigger + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block min-w-0">
          <Breadcrumbs />
        </div>
      </div>

      {/* Right: Search Hint, Notifications, User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search Shortcut Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200 text-slate-400 text-xs">
          <Search className="w-3.5 h-3.5" />
          <span>Cari data siswa, NIP, atau aturan...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] font-mono border border-slate-200 text-slate-500 shadow-2xs">
            ⌘K
          </kbd>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Pemberitahuan sistem"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

        {/* User Profile Dropdown */}
        <UserMenu user={user} />
      </div>
    </header>
  );
}
