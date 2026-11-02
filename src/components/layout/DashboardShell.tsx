"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import MobileNav from "@/components/layout/MobileNav";
import { UserProfile, UserRole } from "@/types/auth";

interface DashboardShellProps {
  user: UserProfile;
  role?: UserRole;
  children: React.ReactNode;
}

export default function DashboardShell({
  user,
  role = user.role,
  children,
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <div className="flex flex-1">
        {/* 1. Desktop Persistent Sidebar */}
        <div className="hidden lg:block shrink-0 sticky top-0 h-screen">
          <Sidebar role={role} />
        </div>

        {/* 2. Main Content Column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navbar */}
          <Navbar
            user={user}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
          />

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 sm:pb-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>

      {/* 3. Mobile Navigation Drawer & Bottom Bar */}
      <MobileNav
        role={role}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  );
}
