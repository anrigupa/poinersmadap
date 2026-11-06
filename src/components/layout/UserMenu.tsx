"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  User,
  LogOut,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { UserProfile } from "@/types/auth";
import { signOutAction } from "@/features/auth/actions/authActions";
import { ROLE_LABELS } from "@/lib/constants/auth";

interface UserMenuProps {
  user: UserProfile;
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "US";

  const roleInfo = ROLE_LABELS[user.role] || {
    title: user.role,
    subtitle: "",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const roleDisplayLabel =
    user.specialization === "guru_bk" || user.teacherType === "counselor"
      ? "Guru BK"
      : user.specialization === "wali_kelas"
      ? `Wali Kelas ${user.className || ""}`.trim()
      : user.specialization === "guru_piket"
      ? "Guru Piket"
      : user.role === "guru"
      ? "Guru Pendidik"
      : user.role === "admin"
      ? "Administrator"
      : user.role === "siswa"
      ? "Siswa"
      : user.role;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pl-2 rounded-2xl hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200 cursor-pointer"
        aria-expanded={isOpen}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-blue-500/20 shrink-0">
          {initials}
        </div>

        {/* User preview on desktop and tablet */}
        <div className="hidden sm:flex flex-col text-left min-w-0">
          <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[140px] sm:max-w-[180px]">
            {user.fullName}
          </span>
          <span className="text-[11px] text-slate-500 font-medium leading-tight truncate">
            {roleDisplayLabel}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-black/10 border border-slate-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Card */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="text-xs font-bold text-slate-900 truncate">{user.fullName}</div>
            <div className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleInfo.badge}`}>
                {roleInfo.title}
              </span>
              {user.nis && (
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                  NIS: {user.nis}
                </span>
              )}
              {user.nip && (
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md truncate max-w-[90px]">
                  NIP: {user.nip}
                </span>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="py-1">
            {user.role === "guru" && (
              <Link
                href="/guru/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Profil Akun</span>
              </Link>
            )}
            <Link
              href="/rules"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Buku Saku Tata Tertib</span>
            </Link>
          </div>

          {/* Sign Out Button */}
          <div className="pt-1 border-t border-slate-100">
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
