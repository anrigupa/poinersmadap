import { signOutAction } from "@/features/auth/actions/authActions";
import { UserProfile } from "@/types/auth";
import { LogOut, ShieldCheck, User } from "lucide-react";
import Link from "next/link";

interface DashboardHeaderProps {
  user: UserProfile;
  roleBadgeText: string;
  roleBadgeColor: string;
  portalTitle: string;
}

export default function DashboardHeader({
  user,
  roleBadgeText,
  roleBadgeColor,
  portalTitle,
}: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Branding & Portal Title */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-slate-900 tracking-tight text-sm">SMADAP POINER</span>
              <span className="hidden sm:inline-block text-slate-400 text-xs ml-2 font-normal">| {portalTitle}</span>
            </div>
          </Link>
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${roleBadgeColor}`}>
            {roleBadgeText}
          </span>
        </div>

        {/* User Info & Sign Out Button */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-900 leading-tight">{user.fullName}</span>
            <span className="text-[11px] text-slate-500">{user.email}</span>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
