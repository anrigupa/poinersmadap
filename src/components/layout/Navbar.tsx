"use client";

import { Menu } from "lucide-react";
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

      {/* Right Side: User Avatar, Teacher Name, Teacher Role, User Menu Dropdown */}
      <div className="flex items-center">
        <UserMenu user={user} />
      </div>
    </header>
  );
}
